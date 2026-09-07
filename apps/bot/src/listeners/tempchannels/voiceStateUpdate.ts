import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions, container } from '@sapphire/framework';
import type { VoiceChannel, VoiceState } from 'discord.js';
import { ChannelType } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	name: 'voiceStateUpdate'
})
export class VoiceStateUpdateListener extends Listener {
	public override async run(
		oldState: VoiceState,
		newState: VoiceState
	): Promise<void> {
		const { guild: guildDB } = container.client.session.guildData.getGuild({
			id: newState.guild.id
		});

		// now user is in hub channel, create him a new voice channel and move him there
		if (newState.channelId) {
			if (!newState.member) return; // should not happen but just in case

			if (newState.channelId === guildDB?.hubChannel && guildDB.hub) {
				const { tempChannel } =
					container.client.session.hubChannels.getTempChannel({
						guildId: newState.guild.id,
						ownerId: newState.member.id
					});
				// user entered hub channel but he already has a temp channel, so move him there
				if (tempChannel) {
					await newState.setChannel(tempChannel.id);
					return;
				}

				const guild = newState.guild;
				const channels = guild.channels;

				const channel = await channels.create({
					name: `${newState.member.user.username}'s channel`,
					type: ChannelType.GuildVoice,
					parent: guildDB?.hub,
					permissionOverwrites: [
						{
							id: newState.member.id,
							allow: [
								'MoveMembers',
								'MuteMembers',
								'DeafenMembers',
								'ManageChannels',
								'Stream'
							]
						}
					]
				});

				container.client.session.hubChannels.createTempChannel({
					guildId: newState.guild.id,
					ownerId: newState.member.id,
					channelId: channel.id
				});

				await newState.member.voice.setChannel(channel);
			} else {
				const { tempChannel } =
					container.client.session.hubChannels.getTempChannel({
						guildId: newState.guild.id,
						ownerId: newState.member.id
					});
				if (!tempChannel) return;

				if (tempChannel.id === newState.channelId) return;

				const channel = (await newState.guild.channels.fetch(
					tempChannel.id
				)) as VoiceChannel;
				if (!channel) return;

				Promise.all([
					channel.delete(),
					container.client.session.hubChannels.deleteTempChannel({
						channelId: tempChannel.id
					})
				]);
			}
		} else if (!newState.channelId) {
			// user left hub channel, delete his temp channel
			deleteChannel(oldState);
		}
	}
}

async function deleteChannel(state: VoiceState) {
	const { tempChannel } = container.client.session.hubChannels.getTempChannel({
		guildId: state.guild.id,
		ownerId: state.member!.id
	});

	if (tempChannel) {
		Promise.all([
			state.channel?.delete(),
			container.client.session.hubChannels.deleteTempChannel({
				channelId: tempChannel.id
			})
		]);
	}
}