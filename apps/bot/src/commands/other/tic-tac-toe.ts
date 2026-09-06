import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { TicTacToeGame } from '../../lib/games/tic-tac-toe.js';
import { GameInvite } from '../../lib/games/inviteEmbed.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { User } from 'discord.js';

const playersInGame: Map<string, User> = new Map();

@ApplyOptions<CommandOptions>({
	name: 'tic-tac-toe',
	description: 'Play a game of Tic-Tac-Toe with another member',
	preconditions: ['isCommandDisabled', 'GuildOnly']
})
export class TicTacToeCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption(option =>
					option
						.setName('opponent')
						.setDescription('The member you want to challenge (optional)')
						.setRequired(false)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const maxPlayers = 2;
		const playerMap = new Map<string, User>();
		const player1 = interaction.user;
		const opponent = interaction.options.getUser('opponent');

		if (opponent?.id === player1.id) {
			return interaction.reply({
				content: ':x: You cannot challenge yourself to a game!',
				ephemeral: true
			});
		}

		if (opponent?.bot) {
			return interaction.reply({
				content: ':x: You cannot challenge bots to a game!',
				ephemeral: true
			});
		}

		if (playersInGame.has(player1.id)) {
			return interaction.reply({
				content: ":x: You can't play more than 1 game at a time.",
				ephemeral: true
			});
		}

		if (opponent && playersInGame.has(opponent.id)) {
			return interaction.reply({
				content: `:x: **${opponent.username}** is already in a game!`,
				ephemeral: true
			});
		}

		playerMap.set(player1.id, player1);
		const gameTitle = 'Tic-Tac-Toe';
		const invite = new GameInvite(gameTitle, [player1], interaction);

		await interaction.reply({
			content: opponent
				? `🎮 **${opponent}**, you have been challenged to **Tic-Tac-Toe** by **${player1.username}**!`
				: undefined,
			embeds: [invite.gameInviteEmbed()],
			components: [invite.gameInviteButtons()]
		});

		const inviteCollector =
			interaction.channel?.createMessageComponentCollector({
				time: 60 * 1000
			});

		inviteCollector?.on('collect', async response => {
			if (response.customId === `${interaction.id}${player1.id}-No`) {
				if (response.user.id !== player1.id) {
					playerMap.delete(response.user.id);
				} else {
					await response.reply({
						content: ':x: You started the invite.',
						ephemeral: true
					});
				}
			}

			if (response.customId === `${interaction.id}${player1.id}-Yes`) {
				if (opponent && response.user.id !== opponent.id) {
					return response.reply({
						content: `:x: Only ${opponent} can accept this specific challenge!`,
						ephemeral: true
					});
				}

				if (playersInGame.has(response.user.id)) {
					return response.reply({
						content: `:x: You are already playing a game.`,
						ephemeral: true
					});
				}

				if (!playerMap.has(response.user.id)) {
					playerMap.set(response.user.id, response.user);
				}
				if (playerMap.size === maxPlayers) {
					return inviteCollector.stop('start-game');
				}
			}

			const accepted: User[] = [];
			playerMap.forEach(player => accepted.push(player));
			const updatedInvite = new GameInvite(gameTitle, accepted, interaction);
			await response.update({
				embeds: [updatedInvite.gameInviteEmbed()]
			});

			if (response.customId === `${interaction.id}${player1.id}-Start`) {
				if (playerMap.has(response.user.id)) {
					if (accepted.length > 1) {
						playerMap.forEach((player: User) =>
							playersInGame.set(player.id, player)
						);
						return inviteCollector.stop('start-game');
					}
				}
			}
		});

		inviteCollector?.on('end', async (_collected, reason) => {
			await interaction.deleteReply().catch(() => {});
			if (playerMap.size === 1 || reason === 'declined') {
				playerMap.forEach(player => playersInGame.delete(player.id));
			}
			if (reason === 'time') {
				await interaction
					.followUp({
						content: `:x: No one responded to your invitation in time.`,
						ephemeral: true
					})
					.catch(() => {});
				if (playerMap.size > 1) {
					playerMap.forEach((player: User) =>
						playersInGame.set(player.id, player)
					);
					return new TicTacToeGame().ticTacToe(interaction, playerMap);
				}
			}
			if (reason === 'start-game') {
				playerMap.forEach((player: User) =>
					playersInGame.set(player.id, player)
				);
				new TicTacToeGame().ticTacToe(interaction, playerMap);
			}
		});

		return;
	}
}

export const help: CommandHelp = {
	name: 'tic-tac-toe',
	category: 'other',
	description: 'Play a game of Tic-Tac-Toe with another member',
	usage: '/tic-tac-toe [opponent: @User]',
	examples: ['/tic-tac-toe', '/tic-tac-toe opponent: @User'],
	options: [
		{
			name: 'opponent',
			description: 'The member you want to challenge (optional)',
			required: false
		}
	]
};
