import Link from 'next/link';
import { prisma } from '@master-bot/db';
import { Terminal, MessageCircle, Server, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default async function ServerIndexPage({
	params
}: {
	params: Promise<{ server_id: string }>;
}) {
	const { server_id } = await params;

	const guild = await prisma.guild.findUnique({
		where: { id: server_id },
		select: {
			name: true,
			id: true,
			disabledCommands: true,
			welcomeMessageEnabled: true,
			volume: true
		}
	});

	if (!guild) {
		return (
			<div className="text-white p-6">
				<h1 className="text-2xl font-bold">Server Not Found</h1>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
					<Server className="h-8 w-8 text-indigo-500" />
					{guild.name}
				</h1>
				<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
					Server ID: <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{guild.id}</code>
				</p>
			</div>

			{/* Quick Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-slate-500 dark:text-slate-400">Slash Commands</span>
						<Terminal className="h-5 w-5 text-indigo-500" />
					</div>
					<div className="mt-3">
						<span className="text-2xl font-bold text-slate-900 dark:text-white">
							{guild.disabledCommands.length} Disabled
						</span>
						<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
							All other commands enabled
						</p>
					</div>
					<div className="mt-4">
						<Button asChild size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
							<Link href={`/dashboard/${server_id}/commands`}>Configure Commands</Link>
						</Button>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome Message</span>
						<MessageCircle className="h-5 w-5 text-emerald-500" />
					</div>
					<div className="mt-3 flex items-center gap-2">
						{guild.welcomeMessageEnabled ? (
							<>
								<CheckCircle2 className="h-5 w-5 text-emerald-500" />
								<span className="text-2xl font-bold text-slate-900 dark:text-white">Active</span>
							</>
						) : (
							<>
								<XCircle className="h-5 w-5 text-rose-500" />
								<span className="text-2xl font-bold text-slate-900 dark:text-white">Inactive</span>
							</>
						)}
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
						{guild.welcomeMessageEnabled ? 'Welcoming new members automatically' : 'Disabled for this guild'}
					</p>
					<div className="mt-4">
						<Button asChild size="sm" variant="outline" className="w-full">
							<Link href={`/dashboard/${server_id}/welcome-message`}>Edit Welcome Settings</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
