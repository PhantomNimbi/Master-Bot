import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { HelpRegistry } from '../../lib/structures/HelpRegistry.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions, container } from '@sapphire/framework';
import {
	ActionRowBuilder,
	AutocompleteInteraction,
	ComponentType,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from 'discord.js';

const CATEGORY_META: Record<
	string,
	{ emoji: string; label: string; description: string }
> = {
	music: {
		emoji: '\u{1F3B5}',
		label: 'Music & Audio',
		description: 'Playback, queues, playlists, and audio controls'
	},
	gifs: {
		emoji: '\u{1F5BC}',
		label: 'Reaction GIFs',
		description: 'Animated reactions and fun GIF commands'
	},
	twitch: {
		emoji: '\u{1F3AE}',
		label: 'Twitch Live Alerts',
		description: 'Stream notifications and Twitch lookups'
	},
	moderation: {
		emoji: '\u{1F528}',
		label: 'Moderation & Server Management',
		description: 'Tools for managing your Discord server'
	},
	other: {
		emoji: '\u{2699}',
		label: 'Utilities & General',
		description: 'Help, settings, and general-purpose commands'
	}
};

function getCategoryMeta(category: string) {
	const key = category.toLowerCase();
	return (
		CATEGORY_META[key] || {
			emoji: '\u{2699}',
			label: key.charAt(0).toUpperCase() + key.slice(1),
			description: 'General commands'
		}
	);
}

function formatCommandList(commands: CommandHelp[]): string {
	if (commands.length === 0) return 'No commands available.';
	return commands.map(c => `/${c.name}`).join(', ');
}

@ApplyOptions<CommandOptions>({
	name: 'help',
	description: 'Browse commands by category or view detailed info for a specific command.',
	preconditions: ['isCommandDisabled']
})
export class HelpCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('command-name')
						.setDescription(
							'Specify a command name to view detailed options and usage.'
						)
						.setAutocomplete(true)
						.setRequired(false)
					)
		);
	}

	public override async autocompleteRun(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);
		const enabledCommands = HelpRegistry.getEnabledCommands();
		const result = enabledCommands
			.map(cmd => ({
				name: `${cmd.name} — ${cmd.description.slice(0, 50)}`,
				value: cmd.name
			}))
			.filter(cmd =>
				cmd.value
					.toLowerCase()
					.startsWith(focusedOption.value.toString().toLowerCase())
			)
			.slice(0, 25);

		return interaction.respond(result);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = container;
		const query = interaction.options.getString('command-name')?.toLowerCase();

		// ─── Individual Command Help ──────────────────────────────────────────
		if (query) {
			const { help: targetHelp, disabled } = HelpRegistry.getCommand(query);

			if (!targetHelp) {
				return await interaction.reply({
					content: `Could not find command /${query}. Use /help to browse available commands.`,
					ephemeral: true
				});
			}

			if (disabled) {
				return await interaction.reply({
					content: `Command /${query} is currently disabled.`,
					ephemeral: true
				});
			}

			const meta = getCategoryMeta(targetHelp.category);

			const detailEmbed = new EmbedBuilder()
				.setTitle(`${meta.emoji}  ${targetHelp.name}`)
				.setColor(0x5865f2)
				.setThumbnail(client.user?.displayAvatarURL() || null)
				.setDescription(targetHelp.description)
				.addFields(
					{
						name: 'Category',
						value: `${meta.emoji}  ${meta.label}`,
						inline: true
					},
					{
						name: 'Usage',
						value: targetHelp.usage || `/${targetHelp.name}`,
						inline: true
					}
				)
				.setFooter({
					text: 'Master-Bot Command Reference',
					iconURL: client.user?.displayAvatarURL() || undefined
				})
				.setTimestamp();

			if (targetHelp.options && targetHelp.options.length > 0) {
				const optionsText = targetHelp.options
					.map(opt => {
						const req = opt.required ? ' (required)' : ' (optional)';
						return `${opt.name}${req}: ${opt.description}`;
					})
					.join('\n');

				detailEmbed.addFields({
					name: 'Parameters',
					value: optionsText
				});
			}

			if (targetHelp.examples && targetHelp.examples.length > 0) {
				detailEmbed.addFields({
					name: 'Examples',
					value: targetHelp.examples.join('\n')
				});
			}

			return await interaction.reply({ embeds: [detailEmbed] });
		}

		// ─── Main Overview Embed ──────────────────────────────────────────────
		const categoriesMap = HelpRegistry.getCategoriesMap();
		const enabledCommands = HelpRegistry.getEnabledCommands();
		const totalCommands = enabledCommands.length;

		const mainEmbed = new EmbedBuilder()
			.setTitle('Master-Bot Command List')
			.setColor(0x5865f2)
			.setThumbnail(client.user?.displayAvatarURL() || null)
			.setDescription(
				`Use the menu below to browse by category, or type /help followed by a command name to see full details.\n\n` +
					`Total commands: ${totalCommands}`
			)
			.setFooter({
				text: 'Select a category below',
				iconURL: client.user?.displayAvatarURL() || undefined
			})
			.setTimestamp();

		categoriesMap.forEach((cmds, cat) => {
			const meta = getCategoryMeta(cat);
			mainEmbed.addFields({
				name: `${meta.emoji}  ${meta.label}  —  ${cmds.length} command${cmds.length !== 1 ? 's' : ''}`,
				value: formatCommandList(cmds)
			});
		});

		// ─── Category Select Menu ─────────────────────────────────────────────
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('help_category_select')
			.setPlaceholder('Browse a category...')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('All Categories')
					.setValue('overview')
					.setDescription('Return to the main command list')
					.setEmoji('\u{1F3E0}')
			);

		categoriesMap.forEach((cmds, cat) => {
			const meta = getCategoryMeta(cat);
			selectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(meta.label)
					.setValue(cat)
					.setDescription(meta.description)
					.setEmoji(meta.emoji)
			);
		});

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			selectMenu
		);

		const response = await interaction.reply({
			embeds: [mainEmbed],
			components: [row],
			fetchReply: true
		});

		// ─── Collector for Category Selection ─────────────────────────────────
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 120000
		});

		collector.on('collect', async i => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({
					content: 'Only the person who ran this command can use the menu.',
					ephemeral: true
				});
				return;
			}

			const selected = i.values[0];

			if (selected === 'overview') {
				await i.update({ embeds: [mainEmbed] });
				return;
			}

			const cmds = categoriesMap.get(selected) || [];
			const meta = getCategoryMeta(selected);

			const categoryEmbed = new EmbedBuilder()
				.setTitle(`${meta.emoji}  ${meta.label}`)
				.setColor(0x5865f2)
				.setThumbnail(client.user?.displayAvatarURL() || null)
				.setDescription(meta.description)
				.addFields({
					name: `Commands in this category`,
					value: formatCommandList(cmds)
				})
				.setFooter({
					text: `Use /help [command-name] for details on any command`,
					iconURL: client.user?.displayAvatarURL() || undefined
				})
				.setTimestamp();

			await i.update({ embeds: [categoryEmbed] });
		});

		collector.on('end', () => {
			interaction.editReply({ components: [] }).catch(() => {});
		});

		return;
	}
}

export const help: CommandHelp = {
	name: 'help',
	category: 'other',
	description: 'Browse commands by category or view detailed info for a specific command.',
	usage: '/help  or  /help command-name: [name]',
	examples: ['/help', '/help command-name: ping'],
	options: [
		{
			name: 'command-name',
			description: 'Specify a command name to view detailed options and usage.',
			required: false
		}
	]
};
