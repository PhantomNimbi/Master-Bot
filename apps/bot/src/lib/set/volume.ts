import { container } from '@sapphire/framework';
import type { SetHandler } from './types';

export const handleDefaultVolume: SetHandler = async interaction => {
	const volume = interaction.options.getInteger('volume', true);
	await container.client.session.guildData.updateVolume({
		guildId: interaction.guildId!,
		volume
	});
	return await interaction.editReply({
		content: `:white_check_mark: Default playback volume for this server set to **${volume}%**.`
	});
};