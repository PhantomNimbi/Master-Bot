import { handleTicketPanel } from '../tickets';
import type { SetOption } from './types';

export const ticketPanelOption: SetOption = {
	name: 'ticket-panel',
	label: 'Ticket Panel',
	description: 'Post an interactive support ticket creation embed panel',
	execute: handleTicketPanel
};
