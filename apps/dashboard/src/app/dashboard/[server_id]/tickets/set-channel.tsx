'use client';

import { api } from '~/utils/api';
import { useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';

export default function TicketChannelSet({
	guildId,
	initialChannel
}: {
	guildId: string;
	initialChannel: string | null;
}) {
	const { toast } = useToast();
	const [value, setValue] = useState(initialChannel ?? '');

	const { data, isLoading } = api.channel.getAll.useQuery({
		guildId
	});

	const { mutate, isPending } = api.tickets.setChannel.useMutation();

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h4 className="text-lg font-medium text-white mb-1">
					📢 Ticket Panel Channel
				</h4>
				<p className="text-sm text-gray-400">
					Select the text channel where the interactive &quot;Open Ticket&quot; panel will be hosted. Ticket threads will spawn inside this channel.
				</p>
			</div>

			{isLoading && !data ? (
				<div className="text-gray-400 text-sm">Loading channels...</div>
			) : (
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
					<Select onValueChange={setValue} defaultValue={value}>
						<SelectTrigger className="w-64 bg-black/60 border-gray-700 text-white">
							<SelectValue placeholder="Select a text channel" />
						</SelectTrigger>
						<SelectContent className="bg-slate-900 border-gray-700 text-white">
							{data?.channels.map(channel => (
								<SelectItem key={channel.id} value={channel.id}>
									#{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						type="button"
						disabled={!value || isPending}
						onClick={() => {
							if (!value) return;
							mutate(
								{
									guildId,
									channelId: value
								},
								{
									onSuccess: () => {
										toast({
											title: 'Ticket channel updated',
											description:
												'Use `/set ticket-panel` in Discord to post or update the ticket creation button.'
										});
									},
									onError: () => {
										toast({
											title: 'Error setting ticket channel',
											description: 'Please try again later.',
											variant: 'destructive'
										});
									}
								}
							);
						}}
					>
						{isPending ? 'Saving...' : 'Save Ticket Channel'}
					</Button>
				</div>
			)}
		</div>
	);
}

