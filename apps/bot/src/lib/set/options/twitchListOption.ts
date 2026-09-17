import { handleTwitchList } from '../twitch';
import type { SetOption } from './types';

export const twitchListOption: SetOption = {
	name: 'twitch-list',
	label: 'Twitch List',
	description: 'List monitored streamers in this server (if Twitch enabled)',
	execute: handleTwitchList
};
