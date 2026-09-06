import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import translate from 'google-translate-api-x';
import Logger from '../../lib/logger';

@ApplyOptions<CommandOptions>({
	name: 'translate',
	description:
		'Translate from any language to any language using Google Translate',
	preconditions: ['GuildOnly', 'isCommandDisabled', 'validateLanguageCode']
})
export class TranslateCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('target')
						.setDescription(
							'What is the target language?(language you want to translate to)'
						)
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('text')
						.setDescription('What text do you want to translate?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const targetLang = interaction.options.getString('target', true);
		const text = interaction.options.getString('text', true);

		try {
			const response: any = await translate(text, {
				to: targetLang,
				requestFunction: axios
			});

			const embed = new EmbedBuilder()
				.setColor('DarkRed')
				.setTitle('Google Translate')
				.setURL('https://translate.google.com/')
				.setDescription(response.text)
				.setFooter({
					iconURL: 'https://i.imgur.com/ZgFxIwe.png',
					text: 'Powered by Google Translate'
				});

			return await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			Logger.error(error);
			return await interaction.editReply(
				':x: Something went wrong when trying to translate the text'
			);
		}
	}
}

export const help: CommandHelp = {
	name: 'translate',
	category: 'other',
	description:
		'Translate from any language to any language using Google Translate',
	usage: '/translate <target> <text>',
	examples: ['/translate target: es text: Hello world'],
	options: [
		{
			name: 'target',
			description:
				'What is the target language?(language you want to translate to)',
			required: true
		},
		{
			name: 'text',
			description: 'What text do you want to translate?',
			required: true
		}
	]
};
