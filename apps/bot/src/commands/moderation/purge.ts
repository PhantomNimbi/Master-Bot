import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ChannelType,
	GuildMember,
	PermissionFlagsBits,
	TextChannel
} from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'purge',
	description: 'Bulk delete messages from the current channel.',
	preconditions: ['isCommandDisabled']
})
export class PurgeCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption(opt =>
					opt
						.setName('amount')
						.setDescription('Number of messages to delete (1 - 100)')
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(100)
				)
				.addUserOption(opt =>
					opt
						.setName('user')
						.setDescription('Only delete messages sent by this user')
						.setRequired(false)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const member = interaction.member as GuildMember;
		const guild = interaction.guild;
		const channel = interaction.channel as TextChannel;

		if (!guild || !member || !channel) {
			return await interaction.reply({
				content: ':x: This command can only be used in a server text channel.',
				ephemeral: true
			});
		}

		if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return await interaction.reply({
				content:
					':x: You must have the `Manage Messages` permission to use this command.',
				ephemeral: true
			});
		}

		const botMember = guild.members.me;
		if (
			!botMember ||
			!botMember.permissions.has(PermissionFlagsBits.ManageMessages)
		) {
			return await interaction.reply({
				content:
					':x: I do not have the `Manage Messages` permission to execute this command.',
				ephemeral: true
			});
		}

		if (channel.type !== ChannelType.GuildText) {
			return await interaction.reply({
				content:
					':x: This command can only be used in a standard text channel.',
				ephemeral: true
			});
		}

		const amount = interaction.options.getInteger('amount', true);
		const targetUser = interaction.options.getUser('user');

		await interaction.deferReply({ ephemeral: true });

		try {
			const fetchedMessages = await channel.messages.fetch({ limit: amount });

			const messagesToDelete = targetUser
				? fetchedMessages.filter(m => m.author.id === targetUser.id)
				: fetchedMessages;

			if (messagesToDelete.size === 0) {
				return await interaction.editReply({
					content: ':warning: No matching messages found to delete.'
				});
			}

			// filterOld: true automatically skips messages older than 14 days without throwing error
			const deleted = await channel.bulkDelete(messagesToDelete, true);

			return await interaction.editReply({
				content: `:wastebasket: Successfully deleted **${deleted.size}** message${
					deleted.size === 1 ? '' : 's'
				}${targetUser ? ` from ${targetUser.tag}` : ''}.`
			});
		} catch (error) {
			this.container.logger.error('Failed to purge messages:', error);
			return await interaction.editReply({
				content: ':x: An error occurred while attempting to delete messages.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'purge',
	category: 'moderation',
	description: 'Bulk delete messages from the current channel.',
	usage: '/purge amount: [1-100] [user: @User]',
	examples: ['/purge amount: 10', '/purge amount: 50 user: @Spammer'],
	options: [
		{
			name: 'amount',
			description: 'Number of messages to delete (1 - 100)',
			required: true
		},
		{
			name: 'user',
			description: 'Only delete messages sent by this user',
			required: false
		}
	]
};
