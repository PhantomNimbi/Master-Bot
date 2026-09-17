import { handleLogDisable } from '../logging';
import type { SetOption } from './types';

export const logDisableOption: SetOption = {
	name: 'log-disable',
	label: 'Log Disable',
	description: 'Disable server audit & moderation logging',
	execute: handleLogDisable
};
