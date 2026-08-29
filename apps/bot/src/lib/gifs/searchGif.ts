import { env } from '../../env';

export async function searchGif(query: string): Promise<string | null> {
	try {
		const apiKey = env.KLIPY_API;
		if (!apiKey) {
			return null;
		}

		const response = await fetch(
			`https://api.klipy.com/v1/search?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&limit=1`
		);
		const json = (await response.json()) as any;

		const url =
			json?.results?.[0]?.url ||
			json?.data?.[0]?.url ||
			json?.results?.[0]?.media_formats?.gif?.url ||
			json?.data?.[0]?.media_formats?.gif?.url ||
			json?.[0]?.url;

		return url || null;
	} catch {
		return null;
	}
}
