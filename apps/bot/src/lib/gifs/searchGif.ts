import { env } from '../../env';

const FALLBACK_GIFS: Record<string, string[]> = {
	anime: [
		'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
		'https://media.giphy.com/media/oF5oUYTOhvFnO/giphy.gif',
		'https://media.giphy.com/media/v0VvNLK6qnT8c/giphy.gif'
	],
	hug: [
		'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
		'https://media.giphy.com/media/lrr9rHuoJOE0w/giphy.gif',
		'https://media.giphy.com/media/xJlOdEYy0N55K/giphy.gif'
	],
	slap: [
		'https://media.giphy.com/media/jLeyZWgtwWP2U/giphy.gif',
		'https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif',
		'https://media.giphy.com/media/Zau0yrl15oqdK480Av/giphy.gif'
	],
	pat: [
		'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
		'https://media.giphy.com/media/5tmRHwTlHAA9WkVxTU/giphy.gif',
		'https://media.giphy.com/media/ye7OTQgwmVuNTY22BQ/giphy.gif'
	],
	cat: [
		'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
		'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
		'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif'
	],
	doggo: [
		'https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif',
		'https://media.giphy.com/media/bbshzgyFQDqPHXBo4c/giphy.gif',
		'https://media.giphy.com/media/4Zo41lhzKt6iZ8xff9/giphy.gif'
	],
	baka: [
		'https://media.giphy.com/media/bOCMPVgsVnRT2/giphy.gif',
		'https://media.giphy.com/media/tO1daDbaecjy0/giphy.gif'
	],
	gintama: [
		'https://media.giphy.com/media/8v6Z3YyUL6GOQ/giphy.gif',
		'https://media.giphy.com/media/Y4gtaaRlLXjLg6MUEg/giphy.gif'
	],
	jojo: [
		'https://media.giphy.com/media/f9jxYYRVPHtKsCf9sy/giphy.gif',
		'https://media.giphy.com/media/TI9HiyUqRm75jDRUUp/giphy.gif'
	],
	waifu: [
		'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
		'https://media.giphy.com/media/v0VvNLK6qnT8c/giphy.gif'
	],
	amongus: [
		'https://media.giphy.com/media/RtdRhc7TxBxB0YAsK6/giphy.gif',
		'https://media.giphy.com/media/0dvhnK4yW1H2S0rU1E/giphy.gif'
	],
	gif: [
		'https://media.giphy.com/media/ule4akeEDWA0/giphy.gif',
		'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif'
	]
};

function getFallbackGif(query: string): string | null {
	const key = query.toLowerCase().replace(/[^a-z0-9]/g, '');
	for (const [cat, list] of Object.entries(FALLBACK_GIFS)) {
		if (key.includes(cat) || cat.includes(key)) {
			return list[Math.floor(Math.random() * list.length)];
		}
	}
	const general = FALLBACK_GIFS.gif;
	return general[Math.floor(Math.random() * general.length)] || null;
}

export async function searchGif(query: string): Promise<string | null> {
	try {
		const apiKey = env.KLIPY_API || process.env.KLIPY_API;
		if (!apiKey) {
			return getFallbackGif(query);
		}

		const response = await fetch(
			`https://api.klipy.com/api/v1/${encodeURIComponent(
				apiKey
			)}/gifs/search?q=${encodeURIComponent(query)}&per_page=20`
		);

		if (!response.ok) {
			return getFallbackGif(query);
		}

		const json = (await response.json()) as any;
		const items = json?.data?.data || json?.data || json?.results || [];

		if (!Array.isArray(items) || items.length === 0) {
			return getFallbackGif(query);
		}

		// Select a random item from results for variety
		const randomItem = items[Math.floor(Math.random() * items.length)];

		const url =
			randomItem?.file?.hd?.gif?.url ||
			randomItem?.file?.md?.gif?.url ||
			randomItem?.file?.sm?.gif?.url ||
			randomItem?.file?.gif?.url ||
			randomItem?.media_formats?.gif?.url ||
			randomItem?.url;

		return url || getFallbackGif(query);
	} catch {
		return getFallbackGif(query);
	}
}
