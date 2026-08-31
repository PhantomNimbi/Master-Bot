// @ts-nocheck
import Discord, { type DiscordProfile } from '@auth/core/providers/discord';
import type { DefaultSession as DefaultSessionType } from '@auth/core/types';
import type { Adapter, AdapterUser } from '@auth/core/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@master-bot/db';
import NextAuth from 'next-auth';

import { env } from './env.mjs';

export type { Session } from 'next-auth';

// Update this whenever adding new providers so that the client can
export const providers = ['discord'] as const;
export type OAuthProviders = (typeof providers)[number];

declare module '@auth/core/adapters' {
	interface AdapterUser {
		discordId?: string;
	}
}

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			discordId: string;
		} & DefaultSessionType['user'];
	}
}

const scope = ['identify', 'guilds', 'email'].join(' ');

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut
} = NextAuth({
	trustHost: true,
	secret: env.NEXTAUTH_SECRET,
	adapter: {
		...PrismaAdapter(prisma),
		createUser: async (data: any) => {
			const discordId = data.discordId || data.id;
			return (await prisma.user.upsert({
				where: { discordId },
				update: {
					name: data.name,
					email: data.email,
					image: data.image
				},
				create: {
					name: data.name,
					email: data.email,
					image: data.image,
					discordId
				}
			})) as any;
		}
	} as any,
	providers: [
		Discord({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			authorization: {
				params: {
					scope
				}
			},
			profile(profile: DiscordProfile) {
				const avatar =
					profile.avatar === null
						? `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(profile.id) >> 22n) % 6}.png`
						: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${profile.avatar.startsWith('a_') ? 'gif' : 'png'}`;

				return {
					id: profile.id,
					name: profile.username,
					email: profile.email,
					image: avatar,
					discordId: profile.id
				};
			}
		}) as any
	],
	callbacks: {
		session: async ({ session, user, token }: any) => {
			const userId = user?.id || token?.sub || session?.user?.id;
			let discordId = (user as any)?.discordId || (token as any)?.discordId || (session?.user as any)?.discordId;

			if (!discordId && userId) {
				const dbUser = await prisma.user.findFirst({
					where: {
						OR: [{ id: userId }, { discordId: userId }]
					},
					select: { id: true, discordId: true, image: true, name: true }
				});
				if (dbUser) {
					discordId = dbUser.discordId;
				}
			}

			if (userId) {
				const account = await prisma.account.findFirst({
					where: {
						userId: userId
					}
				});

				if (
					account &&
					account.expires_at &&
					account.refresh_token &&
					account.expires_at * 1000 < Date.now()
				) {
					// refresh token
					try {
						const response = await fetch(
							'https://discord.com/api/v10/oauth2/token',
							{
								headers: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								method: 'POST',
								body: new URLSearchParams({
									grant_type: 'refresh_token',
									client_id: env.DISCORD_CLIENT_ID,
									client_secret: env.DISCORD_CLIENT_SECRET,
									refresh_token: account.refresh_token
								})
							}
						);

						if (response.ok) {
							const data = await response.json();

							await prisma.account.update({
								where: {
									provider_providerAccountId: {
										provider: account.provider,
										providerAccountId: account.providerAccountId
									}
								},
								data: {
									access_token: data.access_token,
									refresh_token: data.refresh_token,
									expires_at: Math.floor(Date.now() / 1000) + data.expires_in
								}
							});
						}
					} catch (error) {
						console.error('Failed to refresh Discord OAuth token:', error);
					}
				}
			}

			return {
				...session,
				user: {
					...session?.user,
					id: userId || '',
					discordId: discordId || ''
				}
			};
		},
		redirect: async ({ url, baseUrl }: any) => {
			if (url.startsWith('/')) return `${baseUrl}${url}`;
			try {
				const target = new URL(url);
				const base = new URL(baseUrl);
				if (target.origin === base.origin) return url;
				// Allow local development host redirects
				if (
					(target.hostname === 'localhost' || target.hostname === '127.0.0.1') &&
					(base.hostname === 'localhost' || base.hostname === '127.0.0.1')
				) {
					return url;
				}
			} catch {
				return baseUrl;
			}
			return baseUrl;
		}

		// @TODO - if you wanna have auth on the edge
		// jwt: ({ token, profile }) => {
		//   if (profile?.id) {
		//     token.id = profile.id;
		//     token.image = profile.picture;
		//   }
		//   return token;
		// },

		// @TODO
		// authorized({ request, auth }) {
		//   return !!auth?.user
		// }
	}
});
