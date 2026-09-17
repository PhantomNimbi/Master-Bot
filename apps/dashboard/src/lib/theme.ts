export interface ThemeInfo {
	id: string;
	name: string;
	icon: string;
	description: string;
}

export interface ColorSchemeInfo {
	id: string;
	name: string;
	color: string;
}

export const THEMES: ThemeInfo[] = [
	{
		id: 'dark',
		name: 'Dark',
		icon: 'Moon',
		description: 'Charcoal and slate night theme'
	},
	{
		id: 'light',
		name: 'Light',
		icon: 'Sun',
		description: 'Clean, crisp daylight theme'
	},
	{
		id: 'glassmorphism',
		name: 'Glassmorphism',
		icon: 'Sparkles',
		description: 'Frosted glass with luminous radial mesh'
	},
	{
		id: 'cyberpunk',
		name: 'Cyberpunk',
		icon: 'Zap',
		description: 'High-contrast neon yellow & cyan tech'
	},
	{
		id: 'dracula',
		name: 'Dracula',
		icon: 'Skull',
		description: 'Classic purple and vibrant pink'
	},
	{
		id: 'nord',
		name: 'Nord',
		icon: 'Snowflake',
		description: 'Arctic frost and muted blue hues'
	},
	{
		id: 'emerald',
		name: 'Emerald',
		icon: 'Trees',
		description: 'Deep forest green and mint accents'
	}
];

export const COLOR_SCHEMES: ColorSchemeInfo[] = [
	{ id: 'default', name: 'Theme Default', color: '#6366f1' },
	{ id: 'purple', name: 'Amethyst Purple', color: '#a855f7' },
	{ id: 'blue', name: 'Ocean Blue', color: '#3b82f6' },
	{ id: 'emerald', name: 'Emerald Green', color: '#10b981' },
	{ id: 'rose', name: 'Rose Pink', color: '#f43f5e' },
	{ id: 'amber', name: 'Amber Gold', color: '#f59e0b' },
	{ id: 'indigo', name: 'Indigo Violet', color: '#6366f1' },
	{ id: 'crimson', name: 'Crimson Ruby', color: '#ef4444' },
	{ id: 'teal', name: 'Teal Aqua', color: '#14b8a6' },
	{ id: 'sunset', name: 'Sunset Coral', color: '#ff6b6b' },
	{ id: 'cyan', name: 'Electric Cyan', color: '#06b6d4' }
];

export function getThemeInfo(theme?: string): ThemeInfo {
	const t = (theme ?? '').trim().toLowerCase();
	if (t === 'glass' || t === 'glassmorphism') {
		return THEMES[2]!;
	}
	if (t === 'light') {
		return THEMES[1]!;
	}
	if (t === 'cyberpunk') {
		return THEMES[3]!;
	}
	if (t === 'dracula') {
		return THEMES[4]!;
	}
	if (t === 'nord') {
		return THEMES[5]!;
	}
	if (t === 'emerald') {
		return THEMES[6]!;
	}
	return THEMES[0]!;
}

export function getColorSchemeInfo(scheme?: string): ColorSchemeInfo {
	const s = (scheme ?? '').trim().toLowerCase();
	const found = COLOR_SCHEMES.find(c => c.id === s);
	if (found) return found;
	if (s === 'amethyst') return COLOR_SCHEMES.find(c => c.id === 'purple')!;
	if (s === 'ocean') return COLOR_SCHEMES.find(c => c.id === 'blue')!;
	if (s === 'jade' || s === 'green') return COLOR_SCHEMES.find(c => c.id === 'emerald')!;
	if (s === 'pink' || s === 'fuchsia') return COLOR_SCHEMES.find(c => c.id === 'rose')!;
	if (s === 'gold' || s === 'yellow') return COLOR_SCHEMES.find(c => c.id === 'amber')!;
	if (s === 'violet') return COLOR_SCHEMES.find(c => c.id === 'indigo')!;
	if (s === 'ruby' || s === 'red') return COLOR_SCHEMES.find(c => c.id === 'crimson')!;
	if (s === 'aqua') return COLOR_SCHEMES.find(c => c.id === 'teal')!;
	if (s === 'coral' || s === 'orange') return COLOR_SCHEMES.find(c => c.id === 'sunset')!;
	if (s === 'electric') return COLOR_SCHEMES.find(c => c.id === 'cyan')!;
	return COLOR_SCHEMES[0]!;
}
