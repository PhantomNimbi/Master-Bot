import { handleTicketTranscriptDisable } from '../tickets';
import type { SetOption } from './types';

export const ticketTranscriptDisableOption: SetOption = {
	name: 'ticket-transcript-disable',
	label: 'Ticket Transcript Disable',
	description: 'Disable ticket transcript archiving',
	execute: handleTicketTranscriptDisable
};
