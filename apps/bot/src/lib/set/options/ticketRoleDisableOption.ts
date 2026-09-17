import { handleTicketRoleDisable } from '../tickets';
import type { SetOption } from './types';

export const ticketRoleDisableOption: SetOption = {
	name: 'ticket-role-disable',
	label: 'Ticket Role Disable',
	description: 'Remove assigned support ticket manager role',
	execute: handleTicketRoleDisable
};
