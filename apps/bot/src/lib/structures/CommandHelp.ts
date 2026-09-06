import { isCommandNameGloballyDisabled } from '../../preconditions/isCommandDisabled';

export interface CommandHelpOption {
	name: string;
	description: string;
	required?: boolean;
}

export interface CommandHelp {
	name: string;
	category: string;
	description: string;
	usage?: string;
	examples?: string[];
	options?: CommandHelpOption[];
	disabled?: boolean;
}

export function isCommandHelpEnabled(help: CommandHelp): boolean {
	if (help.disabled) return false;
	if (
		isCommandNameGloballyDisabled(help.name) ||
		isCommandNameGloballyDisabled(help.category)
	) {
		return false;
	}
	return true;
}
