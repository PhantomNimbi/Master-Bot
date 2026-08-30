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

export default function TicketTranscriptChannelSet({
	guildId,
	initialChannel
}: {
	guildId: string;
	initialChannel: string | null;
}) {
	const { toast } = useToast();
	const [value, setValue] = useState(initialChannel ?? 'none');

	const { data, isLoading } = api.channel.getAll.useQuery({
		guildId
	});

	const { mutate, isPending } = api.tickets.setTranscriptChannel.useMutation();

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h4 className="text-lg font-medium text-white mb-1">
					📑 Ticket Transcripts Channel (Optional)
				</h4>
				<p className="text-sm text-gray-400">
					When a ticket is closed, Master-Bot compiles all chat messages into a secure text transcript file and posts it with metadata to this channel.
				</p>
			</div>

			{isLoading && !data ? (
				<div className="text-gray-400 text-sm">Loading channels...</div>
			) : (
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
					<Select onValueChange={setValue} defaultValue={value}>
						<SelectTrigger className="w-64 bg-black/60 border-gray-700 text-white">
							<SelectValue placeholder="Select a transcript channel" />
						</SelectTrigger>
						<SelectContent className="bg-slate-900 border-gray-700 text-white">
							<SelectItem value="none">
								🚫 None (Disabled)
							</SelectItem>
							{data?.channels.map(channel => (
								<SelectItem key={channel.id} value={channel.id}>
									#{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						type="button"
						disabled={isPending}
						onClick={() => {
							const channelId = value === 'none' ? null : value;
							mutate(
								{
									guildId,
									channelId
								},
								{
									onSuccess: () => {
										toast({
											title: 'Transcript channel updated',
											description: channelId
												? 'Ticket transcripts will be archived to this channel upon closure.'
												: 'Ticket transcript archiving is now disabled.'
										});
									},
									onError: () => {
										toast({
											title: 'Error setting transcript channel',
											description: 'Please try again later.',
											variant: 'destructive'
										});
									}
								}
							);
						}}
					>
						{isPending ? 'Saving...' : 'Save Transcript Channel'}
					</Button>
				</div>
			)}
		</div>
	);
}

