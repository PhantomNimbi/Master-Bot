import { prisma } from '@master-bot/db';
import TicketToggle from './switch';
import TicketChannelSet from './set-channel';
import TicketTranscriptChannelSet from './set-transcript-channel';
import TicketMessageForm from './ticket-form';
import Link from 'next/link';

function getGuildById(id: string) {
	return prisma.guild.findUnique({
		where: {
			id
		}
	});
}

export default async function TicketsPage({
	params
}: {
	params: Promise<{ server_id: string }>;
}) {
	const { server_id } = await params;
	const guild = await getGuildById(server_id);

	if (!guild) {
		return <div>Error loading guild</div>;
	}

	return (
		<>
			<div className="flex items-center gap-4 mb-2">
				<Link
					href={`/dashboard/${server_id}`}
					className="text-sm text-gray-400 hover:text-white transition-colors"
				>
					← Back to Server
				</Link>
			</div>

			<h1 className="text-3xl font-semibold">Support Ticket System</h1>
			<div className="ml-2 mt-6 flex flex-col gap-6 max-w-5xl">
				<div className="flex flex-col gap-2">
					<h3 className="text-lg text-gray-300">
						Provide members with private, thread-based support and inquiry
						management
					</h3>
					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-400">System Status:</span>
						{guild.ticketEnabled && guild.ticketChannel ? (
							<span className="text-sm font-semibold text-green-400 bg-green-950/50 px-2.5 py-1 rounded-full border border-green-800/40">
								🟢 Enabled
							</span>
						) : (
							<span className="text-sm font-semibold text-red-400 bg-red-950/50 px-2.5 py-1 rounded-full border border-red-800/40">
								🔴 Disabled
							</span>
						)}
						<TicketToggle
							ticketEnabled={Boolean(guild.ticketEnabled)}
							serverId={server_id}
						/>
					</div>
				</div>

				<div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 shadow-sm flex flex-col gap-6">
					<TicketChannelSet
						guildId={server_id}
						initialChannel={guild.ticketChannel}
					/>
					<hr className="border-gray-800" />
					<TicketTranscriptChannelSet
						guildId={server_id}
						initialChannel={guild.ticketTranscriptChannel}
					/>
				</div>

				{guild.ticketEnabled && (
					<TicketMessageForm
						guildId={server_id}
						initialMessage={guild.ticketMessage ?? ''}
						guildName={guild.name || 'Server'}
					/>
				)}
			</div>
		</>
	);
}
