'use client';

import { useState } from 'react';
import {
	Music,
	Play,
	Pause,
	SkipForward,
	Volume2,
	Sliders,
	ListMusic,
	Radio,
	Plus,
	Trash2
} from 'lucide-react';
import { api } from '~/utils/api';

export default function MusicStudioClient() {
	const [volume, setVolume] = useState<number>(100);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [selectedFilter, setSelectedFilter] = useState<string>('none');

	const { data: playlistsData, isLoading: isLoadingPlaylists } =
		api.music.getUserPlaylists.useQuery();

	const filters = [
		{ id: 'none', label: 'Flat (Default)' },
		{ id: 'bassboost', label: 'Bass Boost 8D' },
		{ id: 'nightcore', label: 'Nightcore (+Pitch)' },
		{ id: 'vaporwave', label: 'Vaporwave (Slowed)' },
		{ id: 'karaoke', label: 'Vocal Isolator' }
	];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Left Column: Player & Active Queue (2 cols) */}
			<div className="lg:col-span-2 space-y-6">
				{/* Now Playing Card */}
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
					<div className="flex items-center justify-between mb-4">
						<span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
							Now Playing
						</span>
						<span className="px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-400">
							Queue: 0 tracks
						</span>
					</div>

					<div className="flex flex-col sm:flex-row items-center gap-6 py-4">
						<div className="w-28 h-28 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
							<Music className="w-12 h-12 text-slate-600" />
						</div>

						<div className="flex-1 text-center sm:text-left">
							<h2 className="text-xl font-bold text-white">No Track Playing</h2>
							<p className="text-sm text-slate-400 mt-1">
								Queue a song via Discord command{' '}
								<code className="text-indigo-400">/play</code> or select from
								your playlists below.
							</p>

							{/* Progress Bar Placeholder */}
							<div className="mt-4 space-y-1">
								<div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
									<div className="bg-indigo-500 h-full w-0" />
								</div>
								<div className="flex justify-between text-xs text-slate-500">
									<span>0:00</span>
									<span>0:00</span>
								</div>
							</div>
						</div>
					</div>

					{/* Player Controls Bar */}
					<div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<button
								onClick={() => setIsPlaying(!isPlaying)}
								className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all"
							>
								{isPlaying ? (
									<Pause className="w-5 h-5 fill-current" />
								) : (
									<Play className="w-5 h-5 fill-current ml-0.5" />
								)}
							</button>

							<button className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors">
								<SkipForward className="w-4 h-4" />
							</button>
						</div>

						{/* Volume Slider */}
						<div className="flex items-center gap-3 w-48">
							<Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
							<input
								type="range"
								min="0"
								max="150"
								value={volume}
								onChange={e => setVolume(Number(e.target.value))}
								className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
							/>
							<span className="text-xs font-mono text-slate-400 w-8 text-right">
								{volume}%
							</span>
						</div>
					</div>
				</div>

				{/* Audio DSP Filters */}
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
					<div className="flex items-center gap-2 mb-4">
						<Sliders className="w-4 h-4 text-indigo-400" />
						<h3 className="text-base font-semibold text-white">
							Audio DSP Filters
						</h3>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{filters.map(f => (
							<button
								key={f.id}
								onClick={() => setSelectedFilter(f.id)}
								className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all text-left ${
									selectedFilter === f.id
										? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
										: 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
								}`}
							>
								{f.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Right Column: User Saved Playlists (1 col) */}
			<div className="space-y-6">
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col h-full">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<ListMusic className="w-4 h-4 text-indigo-400" />
							<h3 className="text-base font-semibold text-white">
								Saved Playlists
							</h3>
						</div>
						<button className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-colors">
							<Plus className="w-3.5 h-3.5" />
							<span>New</span>
						</button>
					</div>

					<div className="flex-1 space-y-3 overflow-y-auto max-h-[480px]">
						{isLoadingPlaylists ? (
							<div className="py-8 text-center text-xs text-slate-500">
								Loading your playlists...
							</div>
						) : playlistsData?.playlists?.length ? (
							playlistsData.playlists.map(pl => (
								<div
									key={pl.id}
									className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-between"
								>
									<div>
										<p className="text-sm font-semibold text-white">
											{pl.name}
										</p>
										<p className="text-xs text-slate-400">
											{pl.songs.length}{' '}
											{pl.songs.length === 1 ? 'song' : 'songs'}
										</p>
									</div>

									<button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							))
						) : (
							<div className="py-12 text-center text-xs text-slate-500">
								<Radio className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
								No playlists saved yet. Use{' '}
								<code className="text-indigo-400">/save-to-playlist</code> in
								Discord.
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
