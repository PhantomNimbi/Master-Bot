import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ChannelType,
	GuildMember,
	PermissionFlagsBits,
	TextChannel
} from 'discord.js';
import { createSlowmodeEmbed } from '../../lib/embeds/commands/moderation/slowmodeEmbed';

@ApplyOptions<Command.Options>({
	name: 'slowmode',
	description: 'Set the slowmode message rate limit for a text channel.',
	preconditions: ['isCommandDisabled']
})
export class SlowmodeCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption(opt =>
					opt
						.setName('seconds')
						.setDescription('Slowmode delay in seconds (0 to disable)')
						.setRequired(true)
						.setMinValue(0)
						.setMaxValue(21600)
				)
				.addChannelOption(opt =>
					opt
						.setName('channel')
						.setDescription('Target channel (defaults to current channel)')
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildText)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const member = interaction.member as GuildMember;
		const guild = interaction.guild;

		if (!guild || !member) {
			return await interaction.reply({
				content: ':x: This command can only be used in a server.',
				ephemeral: true
			});
		}

		if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return await interaction.reply({
				content:
					':x: You must have the `Manage Channels` permission to use this command.',
				ephemeral: true
			});
		}

		const botMember = guild.members.me;
		if (
			!botMember ||
			!botMember.permissions.has(PermissionFlagsBits.ManageChannels)
		) {
			return await interaction.reply({
				content:
					':x: I do not have the `Manage Channels` permission to execute this command.',
				ephemeral: true
			});
		}

		const seconds = interaction.options.getInteger('seconds', true);
		const targetChannel = (interaction.options.getChannel('channel') ||
			interaction.channel) as TextChannel;

		if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
			return await interaction.reply({
				content: ':x: Target channel must be a standard text channel.',
				ephemeral: true
			});
		}

		await interaction.deferReply();

		try {
			await targetChannel.setRateLimitPerUser(
				seconds,
				`Slowmode adjusted by ${interaction.user.tag}`
			);

			const embed = createSlowmodeEmbed({
				channelId: targetChannel.id,
				seconds,
				moderator: interaction.user
			});

			return await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			this.container.logger.error('Failed to set slowmode:', error);
			return await interaction.editReply({
				content: ':x: An error occurred while adjusting slowmode.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'slowmode',
	category: 'moderation',
	description: 'Set the slowmode message rate limit for a text channel.',
	usage: '/slowmode seconds: [0-21600] [channel: #channel]',
	examples: [
		'/slowmode seconds: 5',
		'/slowmode seconds: 30 channel: #general',
		'/slowmode seconds: 0'
	],
	options: [
		{
			name: 'seconds',
			description: 'Slowmode delay in seconds (0 to disable)',
			required: true
		},
		{
			name: 'channel',
			description: 'Target channel (defaults to current channel)',
			required: false
		}
	]
};
