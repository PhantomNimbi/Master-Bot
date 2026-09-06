import { getDashboardBaseUrl, getDashboardUrl, getDashboardPort } from '../auth/config.js';

function clean(value: string, stripBotPrefix = false): string {
	let cleaned = (value || '').trim();
	if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
		cleaned = cleaned.slice(1, -1).trim();
	}
	if (stripBotPrefix && cleaned.startsWith('Bot ')) {
		cleaned = cleaned.slice(4).trim();
	}
	return cleaned;
}

export function getBotToken(): string {
	return clean(
		process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.TOKEN || '',
		true
	);
}

export function getClientId(): string {
	return clean(
		process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || process.env.DISCORD_APP_ID || process.env.APPLICATION_ID || process.env.APP_ID || ''
	);
}

export function getCallbackUrl(): string {
	return getDashboardBaseUrl();
}

export function getInviteUrl(): string {
	const raw = clean(process.env.NEXT_PUBLIC_INVITE_URL || '');
	if (raw) return raw;
	const clientId = getClientId();
	if (clientId && clientId !== 'yourclientid') {
		return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
	}
	return '';
}

export function getDashboardPortValue(): number {
	return getDashboardPort();
}

export function getDashboardUrlValue(): string {
	return getDashboardUrl();
}