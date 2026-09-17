import type { SetOption } from './types';
import { viewOption } from './viewOption';
import { welcomeChannelOption } from './welcomeChannelOption';
import { welcomeMessageOption } from './welcomeMessageOption';
import { welcomeToggleOption } from './welcomeToggleOption';
import { welcomeTestOption } from './welcomeTestOption';
import { twitchAddOption } from './twitchAddOption';
import { twitchRemoveOption } from './twitchRemoveOption';
import { twitchListOption } from './twitchListOption';
import { youtubeAddOption } from './youtubeAddOption';
import { youtubeRemoveOption } from './youtubeRemoveOption';
import { youtubeListOption } from './youtubeListOption';
import { logChannelOption } from './logChannelOption';
import { logToggleOption } from './logToggleOption';
import { logDisableOption } from './logDisableOption';
import { ticketChannelOption } from './ticketChannelOption';
import { ticketToggleOption } from './ticketToggleOption';
import { ticketPanelOption } from './ticketPanelOption';
import { ticketTranscriptOption } from './ticketTranscriptOption';
import { ticketTranscriptDisableOption } from './ticketTranscriptDisableOption';
import { ticketRoleOption } from './ticketRoleOption';
import { ticketRoleDisableOption } from './ticketRoleDisableOption';
import { defaultVolumeOption } from './defaultVolumeOption';

export const setOptions: Record<string, SetOption> = {
	view: viewOption,
	'welcome-channel': welcomeChannelOption,
	'welcome-message': welcomeMessageOption,
	'welcome-toggle': welcomeToggleOption,
	'welcome-test': welcomeTestOption,
	'twitch-add': twitchAddOption,
	'twitch-remove': twitchRemoveOption,
	'twitch-list': twitchListOption,
	'youtube-add': youtubeAddOption,
	'youtube-remove': youtubeRemoveOption,
	'youtube-list': youtubeListOption,
	'log-channel': logChannelOption,
	'log-toggle': logToggleOption,
	'log-disable': logDisableOption,
	'ticket-channel': ticketChannelOption,
	'ticket-toggle': ticketToggleOption,
	'ticket-panel': ticketPanelOption,
	'ticket-transcript': ticketTranscriptOption,
	'ticket-transcript-disable': ticketTranscriptDisableOption,
	'ticket-role': ticketRoleOption,
	'ticket-role-disable': ticketRoleDisableOption,
	'default-volume': defaultVolumeOption
};

export function getSetOption(name: string): SetOption | undefined {
	return setOptions[name.toLowerCase()];
}

export function getAllSetOptions(): SetOption[] {
	return Object.values(setOptions);
}

export function getSetChoices(): Array<{ name: string; value: string }> {
	return getAllSetOptions().map(opt => ({
		name: `${opt.label} - ${opt.description}`.slice(0, 100),
		value: opt.name
	}));
}
