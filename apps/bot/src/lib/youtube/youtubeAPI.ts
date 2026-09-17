import Logger from '../logger';

export interface YouTubeChannelInfo {
	channelId: string;
	title: string;
	description?: string;
	customUrl?: string;
	thumbnailUrl?: string;
}

export interface YouTubeVideoItem {
	id: string;
	title: string;
	url: string;
	channelId: string;
	channelTitle: string;
	description: string;
	publishedAt: string;
	thumbnailUrl: string;
	isLive: boolean;
}

export class YouTubeAPI {
	public static get clientId(): string | undefined {
		return process.env.YOUTUBE_CLIENT_ID;
	}

	public static get clientSecret(): string | undefined {
		return process.env.YOUTUBE_CLIENT_SECRET;
	}

	public static get refreshToken(): string | undefined {
		return process.env.YOUTUBE_REFRESH_TOKEN;
	}

	private static cachedAccessToken: { token: string; expiresAt: number } | null = null;

	public static async getAccessToken(): Promise<string | null> {
		if (this.cachedAccessToken && Date.now() < this.cachedAccessToken.expiresAt) {
			return this.cachedAccessToken.token;
		}

		const clientId = this.clientId;
		const clientSecret = this.clientSecret;
		const refreshToken = this.refreshToken;

		if (!clientId || !clientSecret || !refreshToken) {
			return null;
		}

		try {
			const res = await fetch('https://oauth2.googleapis.com/token', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					refresh_token: refreshToken,
					grant_type: 'refresh_token'
				})
			});

			if (res.ok) {
				const data = (await res.json()) as any;
				if (data.access_token) {
					this.cachedAccessToken = {
						token: data.access_token,
						expiresAt: Date.now() + (data.expires_in ? (data.expires_in - 60) * 1000 : 3500 * 1000)
					};
					return data.access_token;
				}
			}
		} catch (err) {
			Logger.warn(`[YouTubeAPI] Error obtaining OAuth access token: ${err}`);
		}
		return null;
	}

	private static async getAuthHeadersAndUrl(
		baseUrl: string
	): Promise<{ url: string; headers: Record<string, string> } | null> {
		const accessToken = await this.getAccessToken();
		if (accessToken) {
			return {
				url: baseUrl,
				headers: { Authorization: `Bearer ${accessToken}` }
			};
		}
		return null;
	}

	/**
	 * Resolves any user-provided channel string (handle `@name`, channel ID `UC...`,
	 * full channel URL, or vanity URL) into a standardized Channel ID and metadata.
	 */
	public static async resolveChannel(
		input: string
	): Promise<YouTubeChannelInfo | null> {
		const trimmed = input.trim();

		// Check if direct channel ID (starts with UC and is 24 chars)
		if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
			return await this.fetchChannelById(trimmed);
		}

		// Extract handle if format is @handle or youtube.com/@handle
		const handleMatch = trimmed.match(/(?:https?:\/\/(?:www\.)?youtube\.com\/)?@([a-zA-Z0-9_.-]+)/i);
		if (handleMatch) {
			const handle = handleMatch[1];
			return await this.fetchChannelByHandle(handle);
		}

		// Extract channel ID from URL if youtube.com/channel/UC...
		const urlMatch = trimmed.match(/(?:https?:\/\/(?:www\.)?youtube\.com\/channel\/)(UC[a-zA-Z0-9_-]{22})/i);
		if (urlMatch) {
			return await this.fetchChannelById(urlMatch[1]);
		}

		// Try handle lookup without @
		return await this.fetchChannelByHandle(trimmed);
	}

	public static async fetchChannelById(
		channelId: string
	): Promise<YouTubeChannelInfo | null> {
		const auth = await this.getAuthHeadersAndUrl(
			`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}`
		);
		if (auth) {
			try {
				const res = await fetch(auth.url, { headers: auth.headers });
				if (res.ok) {
					const data = (await res.json()) as any;
					if (data.items && data.items.length > 0) {
						const item = data.items[0];
						return {
							channelId: item.id,
							title: item.snippet.title,
							description: item.snippet.description,
							customUrl: item.snippet.customUrl,
							thumbnailUrl: item.snippet.thumbnails?.default?.url
						};
					}
				}
			} catch (err) {
				Logger.warn(`[YouTubeAPI] Error fetching channel by ID: ${err}`);
			}
		}

		// Fallback to RSS feed
		return await this.fetchChannelFromRss(channelId);
	}

	public static async fetchChannelByHandle(
		handle: string
	): Promise<YouTubeChannelInfo | null> {
		const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
		const auth = await this.getAuthHeadersAndUrl(
			`https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(cleanHandle)}`
		);

		if (auth) {
			try {
				const res = await fetch(auth.url, { headers: auth.headers });
				if (res.ok) {
					const data = (await res.json()) as any;
					if (data.items && data.items.length > 0) {
						const item = data.items[0];
						return {
							channelId: item.id,
							title: item.snippet.title,
							description: item.snippet.description,
							customUrl: item.snippet.customUrl,
							thumbnailUrl: item.snippet.thumbnails?.default?.url
						};
					}
				}
			} catch (err) {
				Logger.warn(`[YouTubeAPI] Error fetching channel by handle: ${err}`);
			}
		}

		// Web scraper fallback for handle resolution
		try {
			const res = await fetch(`https://www.youtube.com/${cleanHandle}`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
				}
			});
			if (res.ok) {
				const html = await res.text();
				// Extract channelId from canonical link or meta tag
				const match =
					html.match(/<meta itemprop="channelId" content="(UC[a-zA-Z0-9_-]{22})"/i) ||
					html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/i) ||
					html.match(/"browseId":"(UC[a-zA-Z0-9_-]{22})"/i);

				if (match && match[1]) {
					return await this.fetchChannelById(match[1]);
				}
			}
		} catch (err) {
			Logger.warn(`[YouTubeAPI] Fallback handle lookup failed: ${err}`);
		}

		return null;
	}

	private static async fetchChannelFromRss(
		channelId: string
	): Promise<YouTubeChannelInfo | null> {
		try {
			const res = await fetch(
				`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
			);
			if (!res.ok) return null;
			const xml = await res.text();

			const titleMatch = xml.match(/<title>([^<]+)<\/title>/i);
			const title = titleMatch ? titleMatch[1] : channelId;

			return {
				channelId,
				title,
				customUrl: `https://www.youtube.com/channel/${channelId}`
			};
		} catch {
			return null;
		}
	}

	/**
	 * Fetches the latest videos and live streams for a channel.
	 * Uses RSS parsing for high speed and zero quota, plus API enrichment when available.
	 */
	public static async getLatestItems(
		channelId: string
	): Promise<YouTubeVideoItem[]> {
		const items: YouTubeVideoItem[] = [];

		try {
			const res = await fetch(
				`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
			);
			if (!res.ok) return [];
			const xml = await res.text();

			// Parse XML entries
			const entries = xml.split('<entry>');
			for (let i = 1; i < Math.min(entries.length, 6); i++) {
				const entry = entries[i];
				const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
				const titleMatch = entry.match(/<title>([^<]+)<\/title>/i);
				const channelTitleMatch = entry.match(/<name>([^<]+)<\/name>/i);
				const publishedMatch = entry.match(/<published>([^<]+)<\/published>/i);
				const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/i);
				const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/i);

				if (idMatch && titleMatch) {
					const videoId = idMatch[1];
					items.push({
						id: videoId,
						title: titleMatch[1],
						url: `https://www.youtube.com/watch?v=${videoId}`,
						channelId,
						channelTitle: channelTitleMatch ? channelTitleMatch[1] : 'YouTube Channel',
						description: descMatch ? descMatch[1].trim() : '',
						publishedAt: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
						thumbnailUrl: thumbMatch
							? thumbMatch[1]
							: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
						isLive: false
					});
				}
			}
		} catch (err) {
			Logger.error(`[YouTubeAPI] Error fetching RSS feed for ${channelId}:`, err);
		}

		// If OAuth token or API key is available, check video details for live broadcast status
		if (items.length > 0) {
			const ids = items.map(it => it.id).join(',');
			const auth = await this.getAuthHeadersAndUrl(
				`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${ids}`
			);
			if (auth) {
				try {
					const res = await fetch(auth.url, { headers: auth.headers });
					if (res.ok) {
						const data = (await res.json()) as any;
						if (data.items) {
							for (const vid of data.items) {
								const matched = items.find(it => it.id === vid.id);
								if (matched) {
									const broadcast = vid.snippet?.liveBroadcastContent;
									matched.isLive = broadcast === 'live';
								}
							}
						}
					}
				} catch (err) {
					Logger.warn(`[YouTubeAPI] Error enriching live status via API: ${err}`);
				}
			}
		}

		return items;
	}
}
