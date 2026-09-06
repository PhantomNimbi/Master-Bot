import { env } from '~/env.mjs';
import { prisma } from '@master-bot/db';
import type { APIApplicationCommand } from 'discord-api-types/v10';
import CommandToggleSwitch from './toggle-command';
import Link from 'next/link';
import {
	Music,
	Film,
	Tv,
	Newspaper,
	Gamepad2,
	Sparkles,
	SlidersHorizontal,
	Info,
	Shield
} from 'lucide-react';

async function getApplicationCommands() {
	try {
		const response = await fetch(
			`https://discordapp.com/api/applications/${env.DISCORD_CLIENT_ID}/commands`,
			{
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`
				},
				next: { revalidate: 60 }
			}
		);

		if (!response.ok) {
			return [];
		}

		return (await response.json()) as APIApplicationCommand[];
	} catch (e) {
		console.error('Error fetching application commands:', e);
		return [];
	}
}

// Category Command Rosters
const MUSIC_COMMANDS = [
	'play',
	'pause',
	'resume',
	'skip',
	'skipto',
	'queue',
	'volume',
	'bassboost',
	'nightcore',
	'vaporwave',
	'karaoke',
	'seek',
	'shuffle',
	'remove',
	'leave',
	'lyrics',
	'move',
	'create-playlist',
	'delete-playlist',
	'display-playlist',
	'my-playlists',
	'save-to-playlist',
	'remove-from-playlist'
];

const GIF_COMMANDS = [
	'amongus',
	'anime',
	'baka',
	'cat',
	'doggo',
	'gif',
	'gintama',
	'hug',
	'jojo',
	'slap',
	'waifu'
];

const TWITCH_COMMANDS = [
	'add-streamer',
	'remove-streamer',
	'show-announcer-list',
	'twitch-status'
];

const NEWS_COMMANDS = ['news'];

const MODERATION_COMMANDS = ['ban', 'kick', 'slowmode', 'timeout', 'purge'];

const GAME_COMMANDS = [
	'game-search',
	'games',
	'8ball',
	'rockpaperscissors',
	'speedrun'
];

interface CommandCategoryDef {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	isGloballyEnabled: boolean;
	envFlag: string;
	matchCommand: (name: string) => boolean;
}

export default async function CommandsPage({
	params
}: {
	params: Promise<{ server_id: string }>;
}) {
	const { server_id } = await params;

	const guild = await prisma.guild.findUnique({
		where: { id: server_id },
		select: { disabledCommands: true }
	});

	const disabledCommandsList: string[] = Array.isArray(guild?.disabledCommands)
		? guild.disabledCommands
		: JSON.parse(guild?.disabledCommands ?? '[]');

	const rawCommands = await getApplicationCommands();

	// Read environment toggles
	const isLavaEnabled =
		(env.LAVA_ENABLED ?? process.env.LAVA_ENABLED)?.toLowerCase() === 'true';
	const isGifsEnabled =
		(env.GIFS_ENABLED ?? process.env.GIFS_ENABLED)?.toLowerCase() !== 'false';
	const isTwitchEnabled =
		(env.TWITCH_ENABLED ?? process.env.TWITCH_ENABLED)?.toLowerCase() !==
		'false';
	const isNewsEnabled =
		(env.NEWS_ENABLED ?? process.env.NEWS_ENABLED)?.toLowerCase() !== 'false';
	const rawIgdb = env.IGDB_ENABLED ?? process.env.IGDB_ENABLED;
	const isIgdbEnabled =
		rawIgdb !== undefined ? rawIgdb.toLowerCase() !== 'false' : isTwitchEnabled;

	const categories: CommandCategoryDef[] = [
		{
			id: 'moderation',
			title: 'Moderation & Management',
			description:
				'Server management tools, member bans, kicks, timeouts, slowmode, and message purging.',
			icon: Shield,
			isGloballyEnabled: true,
			envFlag: '',
			matchCommand: (name: string) =>
				MODERATION_COMMANDS.includes(name.toLowerCase())
		},
		{
			id: 'music',
			title: 'Music & Audio',
			description:
				'Audio playback, playlist management, queue filters, and volume controls.',
			icon: Music,
			isGloballyEnabled: isLavaEnabled,
			envFlag: 'LAVA_ENABLED',
			matchCommand: (name: string) =>
				MUSIC_COMMANDS.includes(name.toLowerCase())
		},
		{
			id: 'gifs',
			title: 'GIFs & Anime Reactions',
			description:
				'Interactive animated gifs, anime reactions, and social emotes.',
			icon: Film,
			isGloballyEnabled: isGifsEnabled,
			envFlag: 'GIFS_ENABLED',
			matchCommand: (name: string) => GIF_COMMANDS.includes(name.toLowerCase())
		},
		{
			id: 'twitch',
			title: 'Twitch & Stream Alerts',
			description:
				'Twitch streamer monitors, live notification subscriptions, and status checks.',
			icon: Tv,
			isGloballyEnabled: isTwitchEnabled,
			envFlag: 'TWITCH_ENABLED',
			matchCommand: (name: string) =>
				TWITCH_COMMANDS.includes(name.toLowerCase())
		},
		{
			id: 'news',
			title: 'News & Headlines',
			description: 'Global news searches and latest headline digests.',
			icon: Newspaper,
			isGloballyEnabled: isNewsEnabled,
			envFlag: 'NEWS_ENABLED',
			matchCommand: (name: string) => NEWS_COMMANDS.includes(name.toLowerCase())
		},
		{
			id: 'games',
			title: 'Games & Entertainment',
			description:
				'IGDB game database search, minigames, 8ball, and speedrun records.',
			icon: Gamepad2,
			isGloballyEnabled: true,
			envFlag: 'IGDB_ENABLED / TWITCH_ENABLED',
			matchCommand: (name: string) => GAME_COMMANDS.includes(name.toLowerCase())
		},
		{
			id: 'general',
			title: 'General & Utilities',
			description:
				'Information lookup, server utilities, translation, dictionary, and miscellaneous tools.',
			icon: Sparkles,
			isGloballyEnabled: true,
			envFlag: '',
			matchCommand: (name: string) =>
				!MODERATION_COMMANDS.includes(name.toLowerCase()) &&
				!MUSIC_COMMANDS.includes(name.toLowerCase()) &&
				!GIF_COMMANDS.includes(name.toLowerCase()) &&
				!TWITCH_COMMANDS.includes(name.toLowerCase()) &&
				!NEWS_COMMANDS.includes(name.toLowerCase()) &&
				!GAME_COMMANDS.includes(name.toLowerCase())
		}
	];

	// Filter out categories that are globally disabled via ENV
	const activeCategories = categories.filter(cat => cat.isGloballyEnabled);

	return (
		<div className="space-y-8 max-w-6xl">
			<div>
				<h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
					<SlidersHorizontal className="h-8 w-8 text-indigo-500" />
					Command Management Panel
				</h1>
				<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
					Enable or disable slash commands for this server and configure custom
					role permissions.
				</p>
			</div>

			{rawCommands && rawCommands.length > 0 && activeCategories.length > 0 ? (
				<div className="space-y-8">
					{activeCategories.map(category => {
						const categoryCommands = rawCommands.filter(cmd => {
							if (!category.matchCommand(cmd.name)) return false;
							// Specific check for IGDB game-search inside games category
							if (
								cmd.name.toLowerCase() === 'game-search' &&
								(!isIgdbEnabled || !isTwitchEnabled)
							) {
								return false;
							}
							return true;
						});

						if (categoryCommands.length === 0) return null;

						return (
							<div
								key={category.id}
								className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
							>
								{/* Category Header */}
								<div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
											<category.icon className="h-5 w-5" />
										</div>
										<div>
											<h2 className="text-lg font-bold text-slate-900 dark:text-white">
												{category.title}
											</h2>
											<p className="text-xs text-slate-500 dark:text-slate-400">
												{category.description}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
											{categoryCommands.length} commands
										</span>
									</div>
								</div>

								{/* Category Command List */}
								<div className="divide-y divide-slate-100 dark:divide-slate-800/60">
									{categoryCommands.map(command => {
										const isServerDisabled =
											disabledCommandsList.includes(command.id);
										const isCommandEnabled = !isServerDisabled;

										return (
											<div
												key={command.id}
												className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
											>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2.5">
														<Link
															href={`/dashboard/${server_id}/commands/${command.id}`}
															className="font-semibold text-slate-900 dark:text-white hover:text-indigo-500 transition-colors text-base"
														>
															/{command.name}
														</Link>

														{/* Status Badge */}
														{isServerDisabled ? (
															<span className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
																Disabled (Guild)
															</span>
														) : (
															<span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
																Active
															</span>
														)}
													</div>

													<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
														{command.description || 'No description available'}
													</p>
												</div>

												<div>
													<CommandToggleSwitch
														commandEnabled={isCommandEnabled}
														serverId={server_id}
														commandId={command.id}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
					<Info className="h-10 w-10 text-slate-400 mx-auto mb-3" />
					<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
						No Active Commands Available
					</h3>
					<p className="text-sm text-slate-500 mt-1">
						All command categories are currently disabled by global
						configuration or no commands are registered.
					</p>
				</div>
			)}
		</div>
	);
}
