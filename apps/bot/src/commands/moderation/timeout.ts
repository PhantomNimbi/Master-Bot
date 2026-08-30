import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	EmbedBuilder,
	GuildMember,
	PermissionFlagsBits
} from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'timeout',
	description: 'Timeout (mute) a member or remove an active timeout.',
	preconditions: ['isCommandDisabled']
})
export class TimeoutCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption(opt =>
					opt
						.setName('user')
						.setDescription('The member to timeout or unmute')
						.setRequired(true)
				)
				.addIntegerOption(opt =>
					opt
						.setName('duration')
						.setDescription('Timeout duration (0 to remove timeout)')
						.setRequired(true)
						.addChoices(
							{ name: 'Remove Timeout (Unmute)', value: 0 },
							{ name: '1 Minute', value: 60 },
							{ name: '5 Minutes', value: 300 },
							{ name: '10 Minutes', value: 600 },
							{ name: '1 Hour', value: 3600 },
							{ name: '1 Day', value: 86400 },
							{ name: '1 Week', value: 604800 }
						)
				)
				.addStringOption(opt =>
					opt
						.setName('reason')
						.setDescription('Reason for the timeout')
						.setRequired(false)
						.setMaxLength(500)
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

		if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
			return await interaction.reply({
				content:
					':x: You must have the `Timeout Members` permission to use this command.',
				ephemeral: true
			});
		}

		const botMember = guild.members.me;
		if (
			!botMember ||
			!botMember.permissions.has(PermissionFlagsBits.ModerateMembers)
		) {
			return await interaction.reply({
				content:
					':x: I do not have the `Timeout Members` permission to execute this command.',
				ephemeral: true
			});
		}

		const targetUser = interaction.options.getUser('user', true);
		const durationSeconds = interaction.options.getInteger('duration', true);
		const reason =
			interaction.options.getString('reason') || 'No reason specified';

		if (targetUser.id === interaction.user.id) {
			return await interaction.reply({
				content: ':x: You cannot timeout yourself.',
				ephemeral: true
			});
		}

		if (targetUser.id === botMember.id) {
			return await interaction.reply({
				content: ':x: You cannot timeout me with this command.',
				ephemeral: true
			});
		}

		if (targetUser.id === guild.ownerId) {
			return await interaction.reply({
				content: ':x: You cannot timeout the server owner.',
				ephemeral: true
			});
		}

		const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

		if (!targetMember) {
			return await interaction.reply({
				content: ':x: That user is not currently in this server.',
				ephemeral: true
			});
		}

		if (
			member.id !== guild.ownerId &&
			targetMember.roles.highest.position >= member.roles.highest.position
		) {
			return await interaction.reply({
				content:
					':x: You cannot timeout this user because their highest role is higher than or equal to yours.',
				ephemeral: true
			});
		}

		if (
			targetMember.roles.highest.position >= botMember.roles.highest.position
		) {
			return await interaction.reply({
				content:
					':x: I cannot timeout this user because their highest role is higher than or equal to my highest role.',
				ephemeral: true
			});
		}

		if (!targetMember.moderatable) {
			return await interaction.reply({
				content: ':x: This user is not moderatable by the bot.',
				ephemeral: true
			});
		}

		await interaction.deferReply();

		try {
			const timeoutMs = durationSeconds > 0 ? durationSeconds * 1000 : null;
			await targetMember.timeout(
				timeoutMs,
				`${reason} | Moderator: ${interaction.user.tag}`
			);

			const embed = new EmbedBuilder()
				.setTitle(
					durationSeconds === 0
						? '🔊 Timeout Removed'
						: '🔇 Member Timed Out'
				)
				.setColor(durationSeconds === 0 ? 0x2ecc71 : 0xe67e22)
				.setThumbnail(targetUser.displayAvatarURL())
				.addFields(
					{
						name: '👤 User',
						value: `${targetUser.tag} (<@${targetUser.id}>)`,
						inline: true
					},
					{
						name: '🛡️ Moderator',
						value: `${interaction.user.tag} (<@${interaction.user.id}>)`,
						inline: true
					},
					{
						name: '⏳ Duration',
						value:
							durationSeconds === 0
								? '**Removed**'
								: `<t:${Math.floor((Date.now() + durationSeconds * 1000) / 1000)}:R>`,
						inline: true
					},
					{
						name: '📝 Reason',
						value: reason,
						inline: false
					}
				)
				.setFooter({
					text: `User ID: ${targetUser.id}`
				})
				.setTimestamp();

			return await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			this.container.logger.error('Failed to timeout user:', error);
			return await interaction.editReply({
				content: ':x: An error occurred while adjusting member timeout.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'timeout',
	category: 'moderation',
	description: 'Timeout (mute) a member or remove an active timeout.',
	usage: '/timeout user: @User duration: [1m/5m/10m/1h/1d/1w/0] [reason: text]',
	examples: [
		'/timeout user: @User duration: 5 Minutes',
		'/timeout user: @User duration: 1 Hour reason: Excessive spamming',
		'/timeout user: @User duration: Remove Timeout (Unmute)'
	],
	options: [
		{
			name: 'user',
			description: 'The member to timeout or unmute',
			required: true
		},
		{
			name: 'duration',
			description: 'Timeout duration (0 to remove timeout)',
			required: true
		},
		{
			name: 'reason',
			description: 'Reason for the timeout',
			required: false
		}
	]
};

