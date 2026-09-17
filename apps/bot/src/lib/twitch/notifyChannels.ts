import { MessageChannel } from './../structures/ExtendedClient';
import type { TwitchGame, TwitchStream } from './twitchAPI-types';
import { TwitchEmbed } from './TwitchEmbed';
import { container } from '@sapphire/framework';
import {
	ChannelType,
	ForumChannel,
	ThreadChannel,
	type Message
} from 'discord.js';
import Logger from '../logger';

// Twitch ids are non changeable, usernames are not good for reference
export async function notify(query: string[]) {
	const { client } = container;
	const token = client.twitch.auth.access_token;
	if (!token) return;
	if (query.length > 0) {
		const streamMap = new Map();
		const gameMap = new Map();
		const gameIDs: string[] = [];
		await client.twitch.api
			.getStreamingUsers({
				user_ids: query,
				token: token
			})
			.then(async (response: TwitchStream[]) => {
				response.reduce((obj, user) => streamMap.set(user.user_id, user), {});
				response.forEach((streamer, index) => {
					gameIDs.push(streamer.game_id);
				});
				await client.twitch.api
					.getGames({ ids: gameIDs, token: token })
					.then(gameResponse => {
						gameResponse.reduce((obj, game) => gameMap.set(game.id, game), {});
					})
					.catch(async error => {
						Logger.error(
							'Failed to Get Games, refreshing Access Token ' + error
						);
						await client.twitch.api
							.getAccessToken('user:read:email')
							.then(response => {
								client.twitch.auth = {
									access_token: response.access_token,
									refresh_token: response.refresh_token,
									expires_in: response.expires_in,
									token_type: response.token_type,
									scope: response.scope
								};
								return;
							});
					});
				for (const entry of query) {
					const stream: TwitchStream = await streamMap.get(entry);
					const game: TwitchGame = await gameMap.get(stream?.game_id);
					client.twitch.notifyList[entry].live = stream ? true : false;

					// Live
					if (client.twitch.notifyList[entry].live) {
						// Grab stored info before its changed
						const prevGame = client.twitch.notifyList[entry].gameName;
						const prevTitle = client.twitch.notifyList[entry].title;

						// Change stored info
						client.twitch.notifyList[entry].gameName = stream.game_name;
						client.twitch.notifyList[entry].title = stream.title;
						client.twitch.notifyList[entry].userName = stream.user_name;
						client.twitch.notifyList[entry].viewers = stream.viewer_count;
						client.twitch.notifyList[entry].boxArt = game.box_art_url;

						// Stream Started
						if (client.twitch.notifyList[entry].messageSent == false) {
							// Run through ChannelIds List of Entry/Streamer
							for (const channelToMsg of client.twitch.notifyList[entry]
								.sendTo) {
								const channel =
									(client.channels.cache.get(channelToMsg) as MessageChannel) ??
									((await client.channels
										.fetch(channelToMsg)
										.catch(() => null)) as MessageChannel);

								if (channel) {
									const twitchMsg = new TwitchEmbed(
										stream,
										client.twitch.notifyList[entry].userName!,
										client.twitch.notifyList[entry].logo,
										game.box_art_url,
										false, // Offline
										false // Stream Update
									);
									const embed = await twitchMsg.TwitchEmbed();

									if (channel.type === ChannelType.GuildForum) {
										const forum = channel as ForumChannel;
										const postTitle = `🔴 ${stream.user_name} is LIVE: ${stream.title || 'Twitch Stream'}`;
										const safeTitle =
											postTitle.length > 100
												? `${postTitle.slice(0, 97)}...`
												: postTitle;

										try {
											const thread = await forum.threads.create({
												name: safeTitle,
												message: {
													content: `🔴 **${stream.user_name}** is now live on Twitch!\nhttps://twitch.tv/${stream.user_name}`,
													embeds: [embed]
												}
											});

											if (
												!client.twitch.notifyList[entry].messageHandler[
													thread.id
												]
											)
												client.twitch.notifyList[entry].messageHandler[
													thread.id
												] = [thread.id];
											else
												client.twitch.notifyList[entry].messageHandler[
													thread.id
												].push(thread.id);
										} catch (forumErr) {
											Logger.error(
												`Failed to create forum thread alert for ${stream.user_name}:`,
												forumErr
											);
										}
									} else if ('send' in channel) {
										await channel
											.send({
												content: `🔴 **${stream.user_name}** is now live on Twitch!\nhttps://twitch.tv/${stream.user_name}`,
												embeds: [embed]
											})
											.then((message: Message) => {
												// Store the channel and Message ID
												if (
													!client.twitch.notifyList[entry].messageHandler[
														message.channel.id
													]
												)
													client.twitch.notifyList[entry].messageHandler[
														message.channel.id
													] = [message.id];
												else
													client.twitch.notifyList[entry].messageHandler[
														message.channel.id
													].push(message.id);
											})
											.catch(err =>
												Logger.error(
													`Failed to send stream alert to channel ${channel.id}:`,
													err
												)
											);
									}
								}
							}
							client.twitch.notifyList[entry].messageSent = true;

							// Update DataBase
							client.session.twitchConfig.updateNotificationStatus({
								userId: entry,
								sent: true,
								live: true
							});
						} // End of Stream Start

						// Stream Change
						if (prevGame && prevTitle)
							if (prevTitle !== stream.title || prevGame !== stream.game_name)
								if (client.twitch.notifyList[entry].messageSent == true) {
									const twitchMsg = new TwitchEmbed(
										stream,
										client.twitch.notifyList[entry].userName!,
										client.twitch.notifyList[entry].logo,
										client.twitch.notifyList[entry].boxArt!,
										false, // Offline
										true // Stream Update
									);

									// Run through stored Messages
									if (client.twitch.notifyList[entry].messageHandler)
										for (const channelId in client.twitch.notifyList[entry]
											.messageHandler) {
											await client.channels
												.fetch(channelId)
												.then(async channel => {
													for (const messageId in client.twitch.notifyList[entry]
														.messageHandler![channelId]) {
														const targetMsgId =
															client.twitch.notifyList[entry].messageHandler![
																channelId
															][messageId];

														if (channel?.isThread()) {
															const thread = channel as ThreadChannel;
															const starter =
																(await thread.messages
																	.fetch(targetMsgId)
																	.catch(() => null)) ||
																(await thread
																	.fetchStarterMessage()
																	.catch(() => null));
															if (starter) {
																await starter
																	.edit({
																		embeds: [await twitchMsg.TwitchEmbed()]
																	})
																	.catch(error =>
																		Logger.error(
																			'Failed to Edit Stream Notification ' +
																				error
																		)
																	);
															}
														} else if (
															channel?.isTextBased() &&
															'messages' in channel
														) {
															await (channel as any).messages
																.edit(targetMsgId, {
																	embeds: [await twitchMsg.TwitchEmbed()]
																})
																.catch((error: unknown) =>
																	Logger.error(
																		'Failed to Edit Stream Notification ' +
																			error
																	)
																);
														}
													}
												});
										}
								} // End of Stream Change
					} // End of Live

					//Stream Offline
					if (
						client.twitch.notifyList[entry].live == false &&
						client.twitch.notifyList[entry].messageSent == true
					) {
						const twitchMsg = new TwitchEmbed(
							stream,
							client.twitch.notifyList[entry].userName!,
							client.twitch.notifyList[entry].logo,
							client.twitch.notifyList[entry].boxArt!,
							true, // offline
							false, // Stream Update
							client.twitch.notifyList[entry].gameName,
							client.twitch.notifyList[entry].title,
							client.twitch.notifyList[entry].viewers
						);

						// Run through Stored Channel/Messages
						if (client.twitch.notifyList[entry].messageHandler)
							for (const channelId in client.twitch.notifyList[entry]
								.messageHandler) {
								await client.channels.fetch(channelId).then(async channel => {
									for (const messageId in client.twitch.notifyList[entry]
										.messageHandler[channelId]) {
										const targetMsgId =
											client.twitch.notifyList[entry].messageHandler[channelId][
												messageId
											];

										if (channel?.isThread()) {
											const thread = channel as ThreadChannel;
											const starter =
												(await thread.messages
													.fetch(targetMsgId)
													.catch(() => null)) ||
												(await thread
													.fetchStarterMessage()
													.catch(() => null));
											if (starter) {
												await starter
													.edit({
														embeds: [await twitchMsg.TwitchEmbed()]
													})
													.catch(error =>
														Logger.error(
															'Failed to Edit Offline Stream Notification ' +
																error
														)
													);
											}
										} else if (
											channel?.isTextBased() &&
											'messages' in channel
										) {
											await (channel as any).messages
												.edit(targetMsgId, {
													embeds: [await twitchMsg.TwitchEmbed()]
												})
												.catch((error: unknown) =>
													Logger.error(
														'Failed to Edit Offline Stream Notification ' +
															error
													)
												);
										}
									}
								});
							}
						client.twitch.notifyList[entry].messageSent = false;
						client.twitch.notifyList[entry].messageHandler = {};
						// Update DataBase
						client.session.twitchConfig.updateNotificationStatus({
							userId: entry,
							sent: false,
							live: false
						});
					}
				}
			})
			.catch(async error => {
				Logger.error(
					'Failed to Get Streaming Users, refreshing Access Token ' + error
				);

				await client.twitch.api
					.getAccessToken('user:read:email')
					.then(response => {
						client.twitch.auth = {
							access_token: response.access_token,
							refresh_token: response.refresh_token,
							expires_in: response.expires_in,
							token_type: response.token_type,
							scope: response.scope
						};
						return;
					});
			});
	}
}

