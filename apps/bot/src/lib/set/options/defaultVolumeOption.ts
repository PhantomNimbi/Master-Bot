import { container } from '@sapphire/framework';
import type { SetOption } from './types';

export const defaultVolumeOption: SetOption = {
	name: 'default-volume',
	label: 'Default Volume',
	description: 'Set default playback volume for this server (1-100)',
	execute: async interaction => {
		const volume =
			interaction.options.getInteger('number') ??
			interaction.options.getInteger('volume');

		if (volume === null || volume === undefined || volume < 1 || volume > 100) {
			return await interaction.editReply({
				content:
					':x: Please provide a valid `number` option between 1 and 100.\n> Example: `/set setting: default-volume number: 75`'
			});
		}

		await container.client.session.guildData.updateVolume({
			guildId: interaction.guildId!,
			volume
		});

		return await interaction.editReply({
			content: `:white_check_mark: Default playback volume for this server set to **${volume}%**.`
		});
	}
};
