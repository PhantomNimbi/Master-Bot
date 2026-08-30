'use client';

import { useToast } from '~/components/ui/use-toast';
import { Switch } from '~/components/ui/switch';
import { toggleTicketSystem } from './actions';

export default function TicketToggle({
	ticketEnabled,
	serverId
}: {
	ticketEnabled: boolean;
	serverId: string;
}) {
	const { toast } = useToast();

	return (
		<div className="flex items-center space-x-2">
			<Switch
				id="ticket-mode"
				checked={ticketEnabled}
				onCheckedChange={() => {
					toggleTicketSystem(!ticketEnabled, serverId).then(() => {
						toast({
							title: `Support ticket system ${
								ticketEnabled ? 'disabled' : 'enabled'
							}`
						});
					});
				}}
			/>
		</div>
	);
}

