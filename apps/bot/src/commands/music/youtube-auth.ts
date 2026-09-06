import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import {
	getApplicationOwnerUser,
	initiateDeviceFlow,
	pollForRefreshToken
} from '../../lib/music/youtubeOAuth';

@ApplyOptions<CommandOptions>({
	name: 'youtube-auth',
	description: 'Authorize YouTube playback via Device Flow (Owner Only)',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class YoutubeAuthCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = this.container;
		const ownerUser = await getApplicationOwnerUser(client);

		if (ownerUser && interaction.user.id !== ownerUser.id) {
			return await interaction.reply({
				content: ':x: This command is restricted to the bot owner.',
				ephemeral: true
			});
		}

		await interaction.deferReply({ ephemeral: true });

		try {
			const flow = await initiateDeviceFlow();

			const embed = new EmbedBuilder()
				.setTitle('🔑 YouTube OAuth Device Authorization')
				.setColor('Yellow')
				.setDescription(
					`Please authorize YouTube playback for Master-Bot:\n\n` +
						`**Step 1:** Visit [${flow.verification_url}](${flow.verification_url})\n` +
						`**Step 2:** Enter Code: \`${flow.user_code}\`\n\n` +
						`*Waiting for browser authorization... (Expires in ${Math.round(flow.expires_in / 60)} minutes)*`
				)
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });

			const refreshToken = await pollForRefreshToken(
				flow.device_code,
				flow.interval,
				flow.expires_in
			);

			if (refreshToken) {
				const successEmbed = new EmbedBuilder()
					.setTitle('✅ YouTube Authorization Successful')
					.setColor('Green')
					.setDescription(
						`YouTube Audio playback has been successfully authorized!\n` +
							`The refresh token has been automatically saved to \`.youtube-oauth.json\`.`
					)
					.setTimestamp();

				return await interaction.editReply({ embeds: [successEmbed] });
			} else {
				const failEmbed = new EmbedBuilder()
					.setTitle('❌ YouTube Authorization Timed Out')
					.setColor('Red')
					.setDescription(
						`Authorization timed out or was denied. Please run \`/youtube-auth\` again.`
					)
					.setTimestamp();

				return await interaction.editReply({ embeds: [failEmbed] });
			}
		} catch (err: any) {
			return await interaction.editReply({
				content: `:x: Failed to initiate YouTube device flow: ${err?.message || err}`
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'youtube-auth',
	category: 'music',
	description: 'Authorize YouTube playback via Device Flow (Owner Only)',
	usage: '/youtube-auth',
	examples: ['/youtube-auth'],
	options: []
};
