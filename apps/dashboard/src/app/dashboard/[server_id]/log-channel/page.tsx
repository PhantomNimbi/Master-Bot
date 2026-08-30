import { prisma } from '@master-bot/db';
import LogChannelToggle from './switch';
import LogChannelSet from './set-channel';
import LogEventsForm from './log-events-form';
import Link from 'next/link';

function getGuildById(id: string) {
	return prisma.guild.findUnique({
		where: {
			id
		}
	});
}

export default async function LogChannelPage({
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

			<h1 className="text-3xl font-semibold">Audit & Moderation Logging</h1>
			<div className="ml-2 mt-6 flex flex-col gap-6 max-w-5xl">
				<div className="flex flex-col gap-2">
					<h3 className="text-lg text-gray-300">
						Track server events, moderation actions, and audit updates
					</h3>
					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-400">System Status:</span>
						{guild.logChannelEnabled && guild.logChannel ? (
							<span className="text-sm font-semibold text-green-400 bg-green-950/50 px-2.5 py-1 rounded-full border border-green-800/40">
								🟢 Enabled
							</span>
						) : (
							<span className="text-sm font-semibold text-red-400 bg-red-950/50 px-2.5 py-1 rounded-full border border-red-800/40">
								🔴 Disabled
							</span>
						)}
						<LogChannelToggle
							logChannelEnabled={Boolean(guild.logChannelEnabled)}
							serverId={server_id}
						/>
					</div>
				</div>

				<div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 shadow-sm flex flex-col gap-4">
					<LogChannelSet
						guildId={server_id}
						initialChannel={guild.logChannel}
					/>
				</div>

				{guild.logChannelEnabled && (
					<LogEventsForm
						guildId={server_id}
						initialEvents={guild.logEvents || []}
					/>
				)}
			</div>
		</>
	);
}


