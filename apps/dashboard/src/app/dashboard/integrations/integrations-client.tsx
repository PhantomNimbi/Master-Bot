'use client';

import { useState } from 'react';
import { Plus, Video, Bell } from 'lucide-react';

export default function IntegrationsClient() {
	const [streamerName, setStreamerName] = useState<string>('');
	const [guildId, setGuildId] = useState<string>('');
	const [channelId, setChannelId] = useState<string>('');

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Left Column: Register New Streamer (1 col) */}
			<div className="space-y-6">
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
					<h2 className="text-lg font-bold text-white flex items-center gap-2">
						<Video className="w-5 h-5 text-purple-400" />
						<span>Track Streamer</span>
					</h2>

					<div>
						<label
							htmlFor="twitch-username"
							className="block text-xs font-semibold text-slate-300 mb-1"
						>
							Twitch Username *
						</label>
						<input
							id="twitch-username"
							type="text"
							placeholder="e.g. shroud"
							value={streamerName}
							onChange={e => setStreamerName(e.target.value)}
							className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
						/>
					</div>

					<div>
						<label
							htmlFor="twitch-guild-id"
							className="block text-xs font-semibold text-slate-300 mb-1"
						>
							Guild ID *
						</label>
						<input
							id="twitch-guild-id"
							type="text"
							placeholder="e.g. 102938475610293847"
							value={guildId}
							onChange={e => setGuildId(e.target.value)}
							className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
						/>
					</div>

					<div>
						<label
							htmlFor="twitch-channel-id"
							className="block text-xs font-semibold text-slate-300 mb-1"
						>
							Notification Channel ID *
						</label>
						<input
							id="twitch-channel-id"
							type="text"
							placeholder="e.g. 987654321098765432"
							value={channelId}
							onChange={e => setChannelId(e.target.value)}
							className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
						/>
					</div>

					<button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2">
						<Plus className="w-4 h-4" />
						<span>Add Twitch Subscription</span>
					</button>
				</div>
			</div>

			{/* Right Column: Tracked Streamers List (2 cols) */}
			<div className="lg:col-span-2 space-y-6">
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col h-full">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Bell className="w-5 h-5 text-purple-400" />
							<h3 className="text-base font-semibold text-white">
								Active Twitch Live Notifications
							</h3>
						</div>
					</div>

					<div className="py-16 text-center text-xs text-slate-500">
						<Video className="w-10 h-10 mx-auto text-slate-700 mb-3" />
						No streamer subscriptions configured. Enter a Twitch handle to
						receive automated stream notifications when they go live.
					</div>
				</div>
			</div>
		</div>
	);
}
