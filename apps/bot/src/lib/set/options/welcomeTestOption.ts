import { handleWelcomeTest } from '../welcome';
import type { SetOption } from './types';

export const welcomeTestOption: SetOption = {
	name: 'welcome-test',
	label: 'Welcome Test',
	description: 'Send a preview welcome message to verify formatting',
	execute: handleWelcomeTest
};
