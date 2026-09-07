import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { HelpRegistry } from '../../lib/structures/HelpRegistry';
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

const CATEGORY_EMOJIS: Record<string, string> = {
	music: '🎵',
	gifs: '🖼️',
	twitch: '🎮',
	moderation: '🔨',
	other: '⚙️'
};

const CATEGORY_NAMES: Record<string, string> = {
	music: 'Music & Audio',
	gifs: 'Reaction GIFs',
	twitch: 'Twitch Live Alerts',
	moderation: 'Moderation & Server Management',
	other: 'Utilities & General'
};

@ApplyOptions<CommandOptions>({
	name: 'help',
	description:
		'Explore the command list or view detailed info for a specific command.',
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
				name: `/${cmd.name} - ${cmd.description.slice(0, 50)}`,
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

		// 1. Detailed Command Lookup Mode
		if (query) {
			const { help: targetHelp, disabled } = HelpRegistry.getCommand(query);

			if (!targetHelp) {
			return await interaction.reply({
				content: `:x: Could not find command /${query}. Use /help to browse available commands.`,
					ephemeral: true
				});
			}

			if (disabled) {
			return await interaction.reply({
				content: `:warning: Command /${query} is currently disabled while system upgrades are underway.`,
					ephemeral: true
				});
			}

			const category = targetHelp.category.toLowerCase();
			const categoryName =
				CATEGORY_NAMES[category] ||
				category.charAt(0).toUpperCase() + category.slice(1);
			const categoryEmoji = CATEGORY_EMOJIS[category] || '⚙️';

		const detailEmbed = new EmbedBuilder()
			.setTitle(`⚡ ${targetHelp.name}`)
			.setColor(0x4f46e5)
			.setThumbnail(client.user?.displayAvatarURL() || null)
			.setDescription(targetHelp.description || 'No description provided.')
			.addFields(
				{ name: '📂 Category', value: `${categoryEmoji} ${categoryName}`, inline: true },
				{ name: '💻 Usage', value: `${targetHelp.usage || '/' + targetHelp.name}`, inline: true },
				{ name: '📋 Description', value: targetHelp.description || '—', inline: false },
				{ name: '⚙️ Options', value: targetHelp.options?.map(o => `• ${o.name}${o.required ? ' [Req]' : ''}`).join('  ') || 'None', inline: false },
				{ name: '💡 Examples', value: targetHelp.examples?.map(ex => `• ${ex}`).join('  ') || 'None', inline: false }
			)
			.setFooter({ text: 'Master-Bot • /help [command]', iconURL: client.user?.displayAvatarURL() })
			.setTimestamp();

		if (targetHelp.options && targetHelp.options.length > 0) {
			const optionsFormatted = targetHelp.options
				.map(opt => {
					const req = opt.required ? '[Required]' : '[Optional]';
					return `• ${opt.name} ${req} — ${opt.description}`;
				})
				.join('\n');

			detailEmbed.addFields({
				name: '⚙️ Options',
				value: optionsFormatted,
				inline: false
			});
		}

		if (targetHelp.examples && targetHelp.examples.length > 0) {
			detailEmbed.addFields({
				name: '💡 Examples',
				value: targetHelp.examples.map(ex => `• ${ex}`).join('\n'),
				inline: false
			});
		}

			return await interaction.reply({ embeds: [detailEmbed] });
		}

		// 2. Full Overview & Dynamic Category Browsing Mode
		const categoriesMap = HelpRegistry.getCategoriesMap();

		const mainEmbed = new EmbedBuilder()
			.setTitle('🤖 Master-Bot Command Center')
			.setColor(0x4f46e5)
			.setThumbnail(client.user?.displayAvatarURL() || null)
			.setDescription(
				`Welcome to Master-Bot. Browse by category below or type /help [command] for details.`
			)
			.setFooter({
				text: 'Select a category below to view commands • Master-Bot',
				iconURL: client.user?.displayAvatarURL()
			})
			.setTimestamp();

		categoriesMap.forEach((cmds, cat) => {
			const emoji = CATEGORY_EMOJIS[cat] || '⚙️';
			const label =
				CATEGORY_NAMES[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
			mainEmbed.addFields({
				name: `${emoji} ${label} — ${cmds.length} commands`,
				value: cmds.map(c => `• ${c.name}`).join('  '),
				inline: false
			});
		});

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('help_category_select')
			.setPlaceholder('📂 Browse commands by category...')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('All Categories Overview')
					.setValue('overview')
					.setDescription('Return to the main help overview')
					.setEmoji('🏠')
			);

		categoriesMap.forEach((cmds, cat) => {
			const emoji = CATEGORY_EMOJIS[cat] || '⚙️';
			const label =
				CATEGORY_NAMES[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
			selectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(label)
					.setValue(cat)
					.setDescription(`View all ${cmds.length} commands in ${label}`)
					.setEmoji(emoji)
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

		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 60000
		});

		collector.on('collect', async i => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({
					content: '❌ Only the command initiator can use this menu.',
					ephemeral: true
				});
				return;
			}

			const selectedCategory = i.values[0];

			if (selectedCategory === 'overview') {
				await i.update({ embeds: [mainEmbed] });
				return;
			}

			const cmds = categoriesMap.get(selectedCategory) || [];
			const emoji = CATEGORY_EMOJIS[selectedCategory] || '⚙️';
			const label =
				CATEGORY_NAMES[selectedCategory] ||
				selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

			const categoryEmbed = new EmbedBuilder()
				.setTitle(`${emoji} ${label}`)
				.setColor(0x4f46e5)
				.setThumbnail(client.user?.displayAvatarURL() || null)
				.setDescription(
					cmds.map(c => `• /${c.name} — ${c.description}`).join('\n\n')
				)
				.setFooter({
					text: `Category: ${label} • Use /help [command] for details`,
					iconURL: client.user?.displayAvatarURL()
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
	description:
		'Explore the command list or view detailed info for a specific command.',
	usage: '/help [command-name]',
	examples: ['/help', '/help command-name: ping'],
	options: [
		{
			name: 'command-name',
			description: 'Specify a command name to view detailed options and usage.',
			required: false
		}
	]
};
