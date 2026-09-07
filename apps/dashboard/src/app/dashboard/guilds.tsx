'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { api } from '~/utils/api';

const GRADIENTS = [
	'from-indigo-500 to-purple-500',
	'from-emerald-500 to-teal-500',
	'from-rose-500 to-pink-500',
	'from-amber-500 to-orange-500',
	'from-sky-500 to-blue-500',
	'from-fuchsia-500 to-purple-500'
];

export default function GuildsList() {
	const { data, isLoading, isError } = api.guild.getAll.useQuery(undefined, {
		refetchOnReconnect: false,
		retryOnMount: false,
		refetchOnWindowFocus: false
	});

	if (isLoading) return <div className="text-white">Loading...</div>;

	if (isError) return <div className="text-white">Error</div>;

	if (!data || data.guilds.length === 0) {
		return (
			<div>
				<p className="text-white">The bot is not in any servers yet</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
			{data.guilds.map((guild, index) => (
				<div
					key={guild.id}
					className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-colors duration-200 shadow-md flex flex-col items-center text-center"
				>
					<div
						className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg overflow-hidden ${guild.icon ? '' : `bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}`}`}
					>
						{guild.icon ? (
							<img
								src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`}
								alt={guild.name}
								className="w-full h-full object-cover"
							/>
						) : (
							guild.name.charAt(0).toUpperCase()
						)}
					</div>
					<h3 className="text-base font-semibold text-slate-100 truncate max-w-full px-1">
						{guild.name}
					</h3>
					<p className="mt-1 text-xs text-slate-500 font-mono">{guild.id}</p>
					<Button
						className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white"
						asChild
					>
						<Link
							href={`/dashboard/${guild.id}`}
							className="flex items-center justify-center gap-2"
						>
							<Settings className="w-4 h-4" />
							Manage
						</Link>
					</Button>
				</div>
			))}
		</div>
	);
}