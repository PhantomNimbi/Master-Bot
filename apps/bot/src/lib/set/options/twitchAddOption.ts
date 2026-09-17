import { handleTwitchAdd } from '../twitch';
import type { SetOption } from './types';

export const twitchAddOption: SetOption = {
	name: 'twitch-add',
	label: 'Twitch Add',
	description: 'Add streamer alert to a text or forum channel (if Twitch enabled)',
	execute: handleTwitchAdd
};
