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
	other: '⚙️'
};

const CATEGORY_NAMES: Record<string, string> = {
	music: 'Music & Audio',
	gifs: 'Reaction GIFs',
	twitch: 'Twitch Live Alerts',
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
		const commands = container.stores.get('commands');
		const result = commands
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
		const query = interaction
			.options.getString('command-name')
			?.toLowerCase();
		const commandsStore = container.stores.get('commands');

		// 1. Detailed Command Lookup Mode
		if (query) {
			const targetCommand = commandsStore.get(query);
			if (!targetCommand) {
				return await interaction.reply({
					content: `:x: Could not find command **/${query}**. Use \`/help\` to browse available commands.`,
					ephemeral: true
				});
			}

			const appCommand = client.application?.commands.cache.find(
				c => c.name === query
			);
			const category = targetCommand.category?.toLowerCase() || 'other';
			const categoryName = CATEGORY_NAMES[category] || 'General';
			const categoryEmoji = CATEGORY_EMOJIS[category] || '⚙️';

			const detailEmbed = new EmbedBuilder()
				.setTitle(`${categoryEmoji} Command: /${targetCommand.name}`)
				.setColor(0x5865f2)
				.setThumbnail(client.user?.displayAvatarURL() || null)
				.setDescription(`> ${targetCommand.description}`)
				.addFields(
					{
						name: '📂 Category',
						value: `${categoryEmoji} ${categoryName}`,
						inline: true
					},
					{
						name: '💻 Usage',
						value: `\`/${targetCommand.name}${
							appCommand?.options.length ? ' [options]' : ''
						}\``,
						inline: true
					}
				)
				.setFooter({
					text: 'Master-Bot Command Reference',
					iconURL: client.user?.displayAvatarURL()
				})
				.setTimestamp();

			if (appCommand && appCommand.options.length > 0) {
				const optionsFormatted = appCommand.options
					.map((opt: any) => {
						const req = opt.required ? '`[Required]`' : '`[Optional]`';
						return `• **${opt.name}** ${req}\n  ${opt.description}`;
					})
					.join('\n\n');

				detailEmbed.addFields({
					name: '⚙️ Parameters & Options',
					value: optionsFormatted
				});
			}

			return await interaction.reply({ embeds: [detailEmbed] });
		}

		// 2. Full Overview & Interactive Category Browsing Mode
		const categoriesMap = new Map<
			string,
			Array<{ name: string; description: string }>
		>();

		commandsStore.forEach(cmd => {
			const category = cmd.category?.toLowerCase() || 'other';
			if (!categoriesMap.has(category)) {
				categoriesMap.set(category, []);
			}
			categoriesMap.get(category)?.push({
				name: cmd.name,
				description: cmd.description
			});
		});

		const totalCommands = commandsStore.size;

		const mainEmbed = new EmbedBuilder()
			.setTitle('🤖 Master-Bot Command Center')
			.setColor(0x5865f2)
			.setThumbnail(client.user?.displayAvatarURL() || null)
			.setDescription(
				`Welcome to **Master-Bot**! Use the select menu below to explore commands by category or type \`/help [command-name]\` for specific usage details.\n\n` +
					`**📊 Quick Stats:**\n` +
					`• Total Commands: **${totalCommands}**\n` +
					`• Categories: **${categoriesMap.size}**\n` +
					`• Latency: **${client.ws.ping}ms**`
			)
			.setFooter({
				text: 'Select a category below to view commands • Master-Bot',
				iconURL: client.user?.displayAvatarURL()
			})
			.setTimestamp();

		categoriesMap.forEach((cmds, cat) => {
			const emoji = CATEGORY_EMOJIS[cat] || '⚙️';
			const label = CATEGORY_NAMES[cat] || 'General';
			mainEmbed.addFields({
				name: `${emoji} ${label} (${cmds.length})`,
				value: cmds.map(c => `\`/${c.name}\``).join('  '),
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
			const label = CATEGORY_NAMES[cat] || 'General';
			selectMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(label)
					.setValue(cat)
					.setDescription(`View all ${cmds.length} commands in ${label}`)
					.setEmoji(emoji)
			);
		});

		const row =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
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
			const label = CATEGORY_NAMES[selectedCategory] || 'General';

			const categoryEmbed = new EmbedBuilder()
				.setTitle(`${emoji} ${label} Commands (${cmds.length})`)
				.setColor(0x5865f2)
				.setThumbnail(client.user?.displayAvatarURL() || null)
				.setDescription(
					cmds
						.map(c => `• **/${c.name}**\n  > ${c.description}`)
						.join('\n\n')
				)
				.setFooter({
					text: `Category: ${label} • Type /help [command] for options`,
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
