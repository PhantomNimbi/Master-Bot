import crypto from 'node:crypto';

export interface NextAuthConfig {
	url: string;
	internalUrl: string;
	secret: string;
	clientId: string;
	clientSecret: string;
}

export function getDashboardPort(): number {
	const raw = process.env.PORT;
	if (raw) {
		const n = parseInt(raw, 10);
		if (!isNaN(n)) return n;
	}
	return 3000;
}

/**
 * Normalizes a callback URL to its BASE URL form, mirroring HELIX's
 * normalizeCallbackBaseUrl so `DISCORD_CALLBACK_URL` may be provided as either
 * a bare base or the full callback path.
 */
export function normalizeCallbackBaseUrl(raw: string): string {
	const trimmed = (raw || '').trim();
	if (!trimmed) return '';
	const lower = trimmed.toLowerCase();
	const marker = lower.indexOf('/api/auth/callback/');
	const base = marker !== -1 ? trimmed.slice(0, marker) : trimmed;
	return base.replace(/\/+$/, '');
}

/**
 * Public-facing dashboard URL. AUTO-RESOLVED exactly like HELIX:
 * explicit NEXTAUTH_URL for public deployments, else DISCORD_CALLBACK_URL,
 * else http://localhost:<port>. Users never need to supply NEXTAUTH_URL.
 */
export function getDashboardUrl(): string {
	const port = getDashboardPort();
	const explicit = (process.env.NEXTAUTH_URL || '').trim();
	if (explicit) {
		const clean = explicit.replace(/\/+$/, '');
		const url = clean.includes('://')
			? clean
			: clean.includes('localhost') || clean.includes('127.0.0.1')
				? `http://${clean}`
				: `https://${clean}`;
		try {
			const u = new URL(url);
			if (!u.port && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
				u.port = String(port);
			}
			return u.toString().replace(/\/+$/, '');
		} catch {
			return url;
		}
	}

	const explicitCallback = normalizeCallbackBaseUrl(process.env.DISCORD_CALLBACK_URL || '');
	if (explicitCallback) {
		return explicitCallback;
	}

	return `http://localhost:${port}`;
}

/**
 * Internal URL for server-side self-requests. AUTO-RESOLVED (defaults to
 * http://localhost:<port>).
 */
export function getDashboardInternalUrl(): string {
	const port = getDashboardPort();
	const raw = (process.env.NEXTAUTH_INTERNAL_URL || 'http://localhost').trim().replace(/\/+$/, '');
	try {
		const u = new URL(raw.includes('://') ? raw : `http://${raw}`);
		if (!u.port) u.port = String(port);
		return u.toString().replace(/\/+$/, '');
	} catch {
		return `http://localhost:${port}`;
	}
}

export function getDashboardBaseUrl(): string {
	const explicit = normalizeCallbackBaseUrl(process.env.DISCORD_CALLBACK_URL || '');
	if (explicit) {
		return explicit;
	}
	return getDashboardUrl();
}

export function getNextAuthConfig(): NextAuthConfig {
	const url = getDashboardUrl();
	const internalUrl = getDashboardInternalUrl();
	const secret = process.env.NEXTAUTH_SECRET || 'master_bot_dashboard_secret_key_32_bytes_min';
	const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || '';
	const clientSecret = process.env.DISCORD_CLIENT_SECRET || process.env.CLIENT_SECRET || '';
	return { url, internalUrl, secret, clientId, clientSecret };
}

export function createSessionToken(user: { id: string; name: string; email?: string }): string {
	const config = getNextAuthConfig();
	const payload = {
		...user,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
	};
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const signature = crypto
		.createHmac('sha256', config.secret)
		.update(encodedPayload)
		.digest('base64url');
	return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string): any | null {
	if (!token) return null;
	const config = getNextAuthConfig();
	const parts = token.split('.');
	if (parts.length !== 2) return null;
	const [encodedPayload, signature] = parts as [string, string];
	const expectedSig = crypto
		.createHmac('sha256', config.secret)
		.update(encodedPayload)
		.digest('base64url');
	if (signature !== expectedSig) return null;
	try {
		const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
		if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
			return null; // Expired
		}
		return payload;
	} catch {
		return null;
	}
}