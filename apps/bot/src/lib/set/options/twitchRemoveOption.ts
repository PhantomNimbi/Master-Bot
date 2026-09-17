import { handleTwitchRemove } from '../twitch';
import type { SetOption } from './types';

export const twitchRemoveOption: SetOption = {
	name: 'twitch-remove',
	label: 'Twitch Remove',
	description: 'Remove streamer alert from a channel (if Twitch enabled)',
	execute: handleTwitchRemove
};
