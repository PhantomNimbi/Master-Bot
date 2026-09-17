import { handleView } from '../view';
import type { SetOption } from './types';

export const viewOption: SetOption = {
	name: 'view',
	label: 'View Settings',
	description: 'View current server settings overview',
	execute: handleView
};
