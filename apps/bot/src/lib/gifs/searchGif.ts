import { env } from '../../env';

const FALLBACK_GIFS: Record<string, string[]> = {
	anime: [
		'https://media.giphy.com/media/6kakh9bc9gImPt2PeM/giphy.gif',
		'https://media.giphy.com/media/qetTtxaGe11daXlVxu/giphy.gif',
		'https://media.giphy.com/media/fpvLiBtx593G4OghfL/giphy.gif'
	],
	hug: [
		'https://media.giphy.com/media/CxBUkGkh91rfiN4Is9/giphy.gif',
		'https://media.giphy.com/media/7KmCCmbmv850stIY8Q/giphy.gif',
		'https://media.giphy.com/media/atAXRsbDK786cs9lqG/giphy.gif'
	],
	slap: [
		'https://media.giphy.com/media/cFkjszYqxaUr4sjZe7/giphy.gif',
		'https://media.giphy.com/media/vVGcjAu5LgbDm9IWfD/giphy.gif',
		'https://media.giphy.com/media/bdrreSrSNK9EtLc9q2/giphy.gif'
	],
	pat: [
		'https://media.giphy.com/media/ozdUXyzG6X1IHboV0I/giphy.gif',
		'https://media.giphy.com/media/51a3tE91baVGh7U6o5/giphy.gif',
		'https://media.giphy.com/media/jLMOq79F9XIrS4ozsa/giphy.gif'
	],
	cat: [
		'https://media.giphy.com/media/bEI6Dsej0pVeasnPxi/giphy.gif',
		'https://media.giphy.com/media/6hKL8BI8rRNrMRFtAx/giphy.gif',
		'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif'
	],
	doggo: [
		'https://media.giphy.com/media/1keIlrrife8A5luADE/giphy.gif',
		'https://media.giphy.com/media/6eLbMsIfUUpTQMLM0A/giphy.gif',
		'https://media.giphy.com/media/6Ml2jjZbq6zXytByAW/giphy.gif'
	],
	baka: [
		'https://media.giphy.com/media/449KlGQiNgUJcLN8Gg/giphy.gif',
		'https://media.giphy.com/media/0k9oZgI9OZyvE32CS8/giphy.gif',
		'https://media.giphy.com/media/fL17USlobBBQbvoYTn/giphy.gif'
	],
	gintama: [
		'https://media.giphy.com/media/VO7QEhanuAlEu3LhL0/giphy.gif',
		'https://media.giphy.com/media/iw223RP3FSk62M79qt/giphy.gif',
		'https://media.giphy.com/media/DyUejnK0SkLp4vsuyD/giphy.gif'
	],
	jojo: [
		'https://media.giphy.com/media/SICRE9mOzgBOATPUtS/giphy.gif',
		'https://media.giphy.com/media/fXG7DfHYVsrGm5E9zL/giphy.gif',
		'https://media.giphy.com/media/c1PecNgUkkE2X8UwVL/giphy.gif'
	],
	waifu: [
		'https://media.giphy.com/media/OrHEJYbSzwz8QfRUl5/giphy.gif',
		'https://media.giphy.com/media/5JcxsXWUV6Q4k9iDhd/giphy.gif',
		'https://media.giphy.com/media/MmUGJI3JQ1rWIsDtkV/giphy.gif'
	],
	amongus: [
		'https://media.giphy.com/media/0tyOasM1BTUtdyf4nt/giphy.gif',
		'https://media.giphy.com/media/4xe7fdnUbZHMTNPTXc/giphy.gif',
		'https://media.giphy.com/media/kkgGWkhttFE3LgW0Ni/giphy.gif'
	],
	gif: [
		'https://media.giphy.com/media/l0He4tYoErhi0kCDe/giphy.gif',
		'https://media.giphy.com/media/H2fORSKZw4SCQ/giphy.gif',
		'https://media.giphy.com/media/bEI6Dsej0pVeasnPxi/giphy.gif'
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
