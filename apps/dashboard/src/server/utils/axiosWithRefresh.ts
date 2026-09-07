import axios, { type AxiosError } from 'axios';

import { prisma } from '@master-bot/db';

import { env } from '../../env.mjs';

const discordApi = axios.create();

async function refreshAccessToken(refreshToken: string, userId: string) {
	try {
		const params = new URLSearchParams({
			client_id: env.DISCORD_CLIENT_ID,
			client_secret: env.DISCORD_CLIENT_SECRET,
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		});

		let response;

		try {
			response = await discordApi.post(
				'https://discord.com/api/v10/oauth2/token',
				params,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);
		} catch (error) {
			console.error('error in refreshing token', error);
			throw error;
		}

		const {
			access_token,
			refresh_token: newRefreshToken,
			expires_in
		} = response.data;

		await prisma.account.update({
			where: {
				userId
			},
			data: {
				access_token,
				refresh_token: newRefreshToken,
				expires_at: expires_in
			}
		});

		return {
			accessToken: access_token,
			refreshToken: newRefreshToken,
			expiresIn: expires_in
		};
	} catch (error) {
		console.error('Error refreshing access token:', error);
		return null;
	}
}

async function updateUserTokens(
	newTokens: {
		accessToken: string;
		refreshToken: string;
		expiresIn: number;
	},
	userId: string
) {
	try {
		const updatedAccount = await prisma.account.update({
			where: {
				userId
			},
			data: {
				access_token: newTokens.accessToken,
				refresh_token: newTokens.refreshToken,
				expires_at: newTokens.expiresIn
			}
		});

		return updatedAccount;
	} catch (error) {
		console.error('Error updating user tokens:', error);
		return null;
	}
}

discordApi.interceptors.response.use(
	response => {
		return response;
	},
	async (error: Error | AxiosError) => {
		if (axios.isAxiosError(error)) {
			const originalRequest = error.config;

			if (error.code === 'ERR_BAD_REQUEST') {
				const { 'X-User-Id': userId, 'X-Refresh-Token': refreshToken } =
					originalRequest!.headers;

				if (typeof userId !== 'string' || typeof refreshToken !== 'string') {
					throw error;
				}

				const newTokens = await refreshAccessToken(refreshToken, userId);

				if (!newTokens?.accessToken) {
					throw error;
				}

				try {
					await updateUserTokens(newTokens, userId);
				} catch {
					throw error;
				}

				originalRequest!.headers['Authorization'] =
					`Bearer ${newTokens.accessToken}`;

				return discordApi(originalRequest!);
			}
			return Promise.reject(error);
		} else {
			return Promise.reject(error);
		}
	}
);

export { discordApi };