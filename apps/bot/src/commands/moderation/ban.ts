import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, GuildMember, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'ban',
	description: 'Ban a member from the server.',
	preconditions: ['isCommandDisabled']
})
export class BanCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption(opt =>
					opt
						.setName('user')
						.setDescription('The member to ban from this server')
						.setRequired(true)
				)
				.addStringOption(opt =>
					opt
						.setName('reason')
						.setDescription('Reason for the ban')
						.setRequired(false)
						.setMaxLength(500)
				)
				.addIntegerOption(opt =>
					opt
						.setName('delete-messages')
						.setDescription('Purge recent messages sent by this member')
						.setRequired(false)
						.addChoices(
							{ name: "Don't delete any", value: 0 },
							{ name: 'Previous 24 Hours', value: 86400 },
							{ name: 'Previous 7 Days', value: 604800 }
						)
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

		if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
			return await interaction.reply({
				content:
					':x: You must have the `Ban Members` permission to use this command.',
				ephemeral: true
			});
		}

		const botMember = guild.members.me;
		if (
			!botMember ||
			!botMember.permissions.has(PermissionFlagsBits.BanMembers)
		) {
			return await interaction.reply({
				content:
					':x: I do not have the `Ban Members` permission to execute this command.',
				ephemeral: true
			});
		}

		const targetUser = interaction.options.getUser('user', true);
		const reason =
			interaction.options.getString('reason') || 'No reason specified';
		const deleteSeconds =
			interaction.options.getInteger('delete-messages') ?? 0;

		if (targetUser.id === interaction.user.id) {
			return await interaction.reply({
				content: ':x: You cannot ban yourself.',
				ephemeral: true
			});
		}

		if (targetUser.id === botMember.id) {
			return await interaction.reply({
				content: ':x: You cannot ban me with this command.',
				ephemeral: true
			});
		}

		if (targetUser.id === guild.ownerId) {
			return await interaction.reply({
				content: ':x: You cannot ban the server owner.',
				ephemeral: true
			});
		}

		const targetMember = await guild.members
			.fetch(targetUser.id)
			.catch(() => null);

		if (targetMember) {
			if (
				member.id !== guild.ownerId &&
				targetMember.roles.highest.position >= member.roles.highest.position
			) {
				return await interaction.reply({
					content:
						':x: You cannot ban this user because their highest role is higher than or equal to yours.',
					ephemeral: true
				});
			}

			if (
				targetMember.roles.highest.position >= botMember.roles.highest.position
			) {
				return await interaction.reply({
					content:
						':x: I cannot ban this user because their highest role is higher than or equal to my highest role.',
					ephemeral: true
				});
			}

			if (!targetMember.bannable) {
				return await interaction.reply({
					content: ':x: This user is not bannable by the bot.',
					ephemeral: true
				});
			}
		}

		await interaction.deferReply();

		try {
			await guild.members.ban(targetUser.id, {
				deleteMessageSeconds: deleteSeconds,
				reason: `${reason} | Moderator: ${interaction.user.tag}`
			});

			const embed = new EmbedBuilder()
				.setTitle('🔨 Member Banned')
				.setColor(0xed4245)
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
			this.container.logger.error('Failed to ban user:', error);
			return await interaction.editReply({
				content: ':x: An error occurred while attempting to ban this user.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'ban',
	category: 'moderation',
	description: 'Ban a member from the server.',
	usage: '/ban user: @User [reason: text] [delete-messages: 0/1/7 days]',
	examples: [
		'/ban user: @User',
		'/ban user: @User reason: Violating server rules',
		'/ban user: @User reason: Spam delete-messages: Previous 24 Hours'
	],
	options: [
		{
			name: 'user',
			description: 'The member to ban from this server',
			required: true
		},
		{
			name: 'reason',
			description: 'Reason for the ban',
			required: false
		},
		{
			name: 'delete-messages',
			description: 'Purge recent messages sent by this member',
			required: false
		}
	]
};
