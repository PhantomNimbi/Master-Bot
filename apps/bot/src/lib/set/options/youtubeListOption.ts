import { handleYouTubeList } from '../youtube';
import type { SetOption } from './types';

export const youtubeListOption: SetOption = {
	name: 'youtube-list',
	label: 'YouTube List',
	description: 'List configured YouTube channel alerts',
	execute: handleYouTubeList
};
