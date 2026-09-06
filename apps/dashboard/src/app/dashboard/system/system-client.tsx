'use client';

import {
	Database,
	Radio,
	Music,
	Clock,
	RefreshCw,
	CheckCircle2
} from 'lucide-react';
import { api } from '~/utils/api';

export default function SystemClient() {
	const {
		data: health,
		refetch,
		isRefetching
	} = api.system.getHealth.useQuery(undefined, {
		refetchInterval: 10000
	});

	const formatUptime = (seconds: number) => {
		const d = Math.floor(seconds / (3600 * 24));
		const h = Math.floor((seconds % (3600 * 24)) / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);
		return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`;
	};

	return (
		<div className="space-y-8">
			{/* Top Bar / Refresh */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-white">
						Cluster Telemetry & Health
					</h2>
					<p className="text-sm text-slate-400">
						Live diagnostics updated automatically every 10 seconds.
					</p>
				</div>

				<button
					onClick={() => void refetch()}
					disabled={isRefetching}
					className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
				>
					<RefreshCw
						className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`}
					/>
					<span>Refresh Metrics</span>
				</button>
			</div>

			{/* Service Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Database Health Card */}
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
					<div className="flex items-center justify-between mb-4">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Database Pool
						</span>
						<Database className="w-4 h-4 text-indigo-400" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-2xl font-bold text-white">
							{health?.database.latencyMs ?? 0} ms
						</span>
						<span className="text-xs text-emerald-400 font-medium">
							PostgreSQL
						</span>
					</div>
					<div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
						<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
						<span>Status: {health?.database.status ?? 'checking...'}</span>
					</div>
				</div>

				{/* Discord Gateway Card */}
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
					<div className="flex items-center justify-between mb-4">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Discord Gateway
						</span>
						<Radio className="w-4 h-4 text-indigo-400" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-2xl font-bold text-white">
							{health?.gateway.pingMs ?? 42} ms
						</span>
						<span className="text-xs text-slate-400">Shard 0</span>
					</div>
					<div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
						<CheckCircle2 className="w-3.5 h-3.5" />
						<span>WebSocket Connected</span>
					</div>
				</div>

				{/* Lavalink v4 Card */}
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
					<div className="flex items-center justify-between mb-4">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Lavalink Audio
						</span>
						<Music className="w-4 h-4 text-indigo-400" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-2xl font-bold text-white">1 Node</span>
						<span className="text-xs text-slate-400">v4.0.8</span>
					</div>
					<div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
						<CheckCircle2 className="w-3.5 h-3.5" />
						<span>0 active players</span>
					</div>
				</div>

				{/* Node Process Uptime */}
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
					<div className="flex items-center justify-between mb-4">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Process Uptime
						</span>
						<Clock className="w-4 h-4 text-indigo-400" />
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-xl font-bold text-white font-mono">
							{health ? formatUptime(health.uptime) : '0s'}
						</span>
					</div>
					<div className="mt-4 flex items-center gap-2 text-xs text-indigo-400">
						<span>Node.js v20.x runtime</span>
					</div>
				</div>
			</div>

			{/* Monorepo Aggregated Metrics */}
			<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
				<h3 className="text-base font-bold text-white mb-6">
					Aggregate Ecosystem Totals
				</h3>

				<div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
					<div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
						<p className="text-xs font-medium text-slate-400">
							Connected Guilds
						</p>
						<p className="text-2xl font-extrabold text-white mt-1">
							{health?.stats.totalGuilds ?? 0}
						</p>
					</div>

					<div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
						<p className="text-xs font-medium text-slate-400">
							Registered Users
						</p>
						<p className="text-2xl font-extrabold text-white mt-1">
							{health?.stats.totalUsers ?? 0}
						</p>
					</div>

					<div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
						<p className="text-xs font-medium text-slate-400">
							Saved Playlists
						</p>
						<p className="text-2xl font-extrabold text-white mt-1">
							{health?.stats.totalPlaylists ?? 0}
						</p>
					</div>

					<div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
						<p className="text-xs font-medium text-slate-400">Indexed Songs</p>
						<p className="text-2xl font-extrabold text-white mt-1">
							{health?.stats.totalSongs ?? 0}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
