import http from 'node:http';
import {
	createSessionToken,
	getNextAuthConfig,
	verifySessionToken
} from './config.js';

export function parseCookies(cookieHeader?: string): Record<string, string> {
	const cookies: Record<string, string> = {};
	if (!cookieHeader) return cookies;
	for (const item of cookieHeader.split(';')) {
		const [name, ...val] = item.trim().split('=');
		if (name) cookies[name] = decodeURIComponent(val.join('='));
	}
	return cookies;
}

const SESSION_COOKIE = 'next-auth.session-token';
const SECURE_SESSION_COOKIE = '__Secure-next-auth.session-token';

async function exchangeCodeForToken(code: string, redirectUri: string): Promise<any | null> {
	const config = getNextAuthConfig();
	try {
		const body = new URLSearchParams({
			client_id: config.clientId,
			client_secret: config.clientSecret,
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri
		});
		const response = await fetch('https://discord.com/api/v10/oauth2/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body
		});
		if (!response.ok) return null;
		return await response.json();
	} catch {
		return null;
	}
}

async function fetchCurrentUser(accessToken: string): Promise<any | null> {
	try {
		const response = await fetch('https://discord.com/api/v10/users/@me', {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		if (!response.ok) return null;
		return await response.json();
	} catch {
		return null;
	}
}

async function fetchUserGuilds(accessToken: string): Promise<any[]> {
	try {
		const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		if (!response.ok) return [];
		return (await response.json()) as any[];
	} catch {
		return [];
	}
}

export async function handleNextAuth(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	pathname: string,
	query: URLSearchParams,
	baseUrl: string
): Promise<boolean> {
	const config = getNextAuthConfig();
	const resolvedBase = baseUrl.replace(/\/+$/, '') || config.url;

	// 1. Providers endpoint: /api/auth/providers
	if (pathname === '/api/auth/providers') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				discord: {
					id: 'discord',
					name: 'Discord',
					type: 'oauth',
					signinUrl: `${resolvedBase}/api/auth/signin/discord`,
					callbackUrl: `${resolvedBase}/api/auth/callback/discord`
				}
			})
		);
		return true;
	}

	// 2. CSRF Token endpoint: /api/auth/csrf
	if (pathname === '/api/auth/csrf') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ csrfToken: 'master_bot_csrf_token_active' }));
		return true;
	}

	// 3. Session endpoint: /api/auth/session
	if (pathname === '/api/auth/session') {
		const cookies = parseCookies(req.headers.cookie);
		const sessionToken =
			cookies[SESSION_COOKIE] || cookies[SECURE_SESSION_COOKIE];
		const sessionUser = verifySessionToken(sessionToken);

		res.writeHead(200, { 'Content-Type': 'application/json' });
		if (sessionUser) {
			res.end(
				JSON.stringify({
					user: {
						id: sessionUser.id,
						name: sessionUser.name,
						email: sessionUser.email || null
					},
					expires: new Date(sessionUser.exp * 1000).toISOString()
				})
			);
		} else {
			res.end(JSON.stringify({ user: null }));
		}
		return true;
	}

	// 4. Sign in: /api/auth/signin or /api/auth/signin/discord
	if (pathname === '/api/auth/signin' || pathname === '/api/auth/signin/discord') {
		if (!config.clientId || !config.clientSecret) {
			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			res.end(
				'<h1>DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET are not configured in .env</h1><p><a href="/dashboard">Back to Dashboard</a></p>'
			);
			return true;
		}

		const redirectUri = encodeURIComponent(`${resolvedBase}/api/auth/callback/discord`);
		const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${config.clientId}&response_type=code&scope=identify%20guilds&redirect_uri=${redirectUri}`;

		res.writeHead(302, { Location: discordAuthUrl });
		res.end();
		return true;
	}

	// 5. Callback: /api/auth/callback/discord
	if (pathname === '/api/auth/callback/discord') {
		const code = query.get('code');
		const redirectUri = `${resolvedBase}/api/auth/callback/discord`;

		if (code) {
			const tokenData = await exchangeCodeForToken(code, redirectUri);
			if (tokenData?.access_token) {
				const user = await fetchCurrentUser(tokenData.access_token);
				if (user?.id) {
					const sessionToken = createSessionToken({
						id: user.id,
						name: user.username || 'Discord User',
						email: user.email || null
					});
					res.writeHead(302, {
						Location: '/dashboard',
						'Set-Cookie': `${SESSION_COOKIE}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
					});
					res.end();
					return true;
				}
			}
		}

		res.writeHead(302, { Location: '/api/auth/signin/discord' });
		res.end();
		return true;
	}

	// 6. Sign out: /api/auth/signout
	if (pathname === '/api/auth/signout') {
		res.writeHead(302, {
			'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
			Location: '/dashboard'
		});
		res.end();
		return true;
	}

	return false;
}

export { fetchUserGuilds };