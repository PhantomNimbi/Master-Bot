import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, GuildMember, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'kick',
	description: 'Kick a member from the server.',
	preconditions: ['isCommandDisabled']
})
export class KickCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption(opt =>
					opt
						.setName('user')
						.setDescription('The member to kick from this server')
						.setRequired(true)
				)
				.addStringOption(opt =>
					opt
						.setName('reason')
						.setDescription('Reason for kicking the member')
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

		if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
			return await interaction.reply({
				content:
					':x: You must have the `Kick Members` permission to use this command.',
				ephemeral: true
			});
		}

		const botMember = guild.members.me;
		if (
			!botMember ||
			!botMember.permissions.has(PermissionFlagsBits.KickMembers)
		) {
			return await interaction.reply({
				content:
					':x: I do not have the `Kick Members` permission to execute this command.',
				ephemeral: true
			});
		}

		const targetUser = interaction.options.getUser('user', true);
		const reason =
			interaction.options.getString('reason') || 'No reason specified';

		if (targetUser.id === interaction.user.id) {
			return await interaction.reply({
				content: ':x: You cannot kick yourself.',
				ephemeral: true
			});
		}

		if (targetUser.id === botMember.id) {
			return await interaction.reply({
				content: ':x: You cannot kick me with this command.',
				ephemeral: true
			});
		}

		if (targetUser.id === guild.ownerId) {
			return await interaction.reply({
				content: ':x: You cannot kick the server owner.',
				ephemeral: true
			});
		}

		const targetMember = await guild.members
			.fetch(targetUser.id)
			.catch(() => null);

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
					':x: You cannot kick this user because their highest role is higher than or equal to yours.',
				ephemeral: true
			});
		}

		if (
			targetMember.roles.highest.position >= botMember.roles.highest.position
		) {
			return await interaction.reply({
				content:
					':x: I cannot kick this user because their highest role is higher than or equal to my highest role.',
				ephemeral: true
			});
		}

		if (!targetMember.kickable) {
			return await interaction.reply({
				content: ':x: This user is not kickable by the bot.',
				ephemeral: true
			});
		}

		await interaction.deferReply();

		try {
			await targetMember.kick(`${reason} | Moderator: ${interaction.user.tag}`);

			const embed = new EmbedBuilder()
				.setTitle('👢 Member Kicked')
				.setColor(0xf1c40f)
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
			this.container.logger.error('Failed to kick user:', error);
			return await interaction.editReply({
				content: ':x: An error occurred while attempting to kick this user.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'kick',
	category: 'moderation',
	description: 'Kick a member from the server.',
	usage: '/kick user: @User [reason: text]',
	examples: [
		'/kick user: @User',
		'/kick user: @User reason: Inappropriate conduct'
	],
	options: [
		{
			name: 'user',
			description: 'The member to kick from this server',
			required: true
		},
		{
			name: 'reason',
			description: 'Reason for kicking the member',
			required: false
		}
	]
};
