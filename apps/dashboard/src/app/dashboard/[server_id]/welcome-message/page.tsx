import { prisma } from '@master-bot/db';
import WelcomeMessageToggle from './switch';
import WelcomeMessageChannelSet from './set-channel';
import WelcomeMessageForm from './welcome-form';

function getGuildById(id: string) {
	return prisma.guild.findUnique({
		where: {
			id
		}
	});
}

export default async function WelcomeMessagePage({
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
			<h1 className="text-3xl font-semibold">Welcome Message Settings</h1>
			<div className="ml-2 mt-6 flex flex-col gap-6 max-w-4xl">
				<div className="flex flex-col gap-2">
					<h3 className="text-lg text-gray-300">Welcome new users with a custom message</h3>
					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-400">System Status:</span>
						{guild.welcomeMessageEnabled ? (
							<span className="text-sm font-semibold text-green-400 bg-green-950/50 px-2.5 py-1 rounded-full border border-green-800/40">
								🟢 Enabled
							</span>
						) : (
							<span className="text-sm font-semibold text-red-400 bg-red-950/50 px-2.5 py-1 rounded-full border border-red-800/40">
								🔴 Disabled
							</span>
						)}
						<WelcomeMessageToggle
							welcomeMessageEnabled={guild.welcomeMessageEnabled}
							serverId={server_id}
						/>
					</div>
				</div>

				{guild.welcomeMessageEnabled && (
					<div className="flex flex-col gap-6">
						<div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
							<WelcomeMessageChannelSet guildId={server_id} />
						</div>

						<WelcomeMessageForm
							guildId={server_id}
							initialMessage={guild.welcomeMessage ?? ''}
							guildName={guild.name || 'Server'}
						/>
					</div>
				)}
			</div>
		</>
	);
}
