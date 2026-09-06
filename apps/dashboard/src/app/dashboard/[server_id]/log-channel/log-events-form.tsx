'use client';

import { useState } from 'react';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';
import { updateLogEvents } from './actions';

export interface LogCategory {
	name: string;
	description: string;
	icon: string;
	events: {
		id: string;
		label: string;
		description: string;
	}[];
}

export const LOG_CATEGORIES: LogCategory[] = [
	{
		name: 'Member Events',
		description: 'Track member join/leave and profile updates',
		icon: '👥',
		events: [
			{
				id: 'member_join',
				label: 'Member Joined',
				description:
					'Logs when a new member joins the server with account age and member count.'
			},
			{
				id: 'member_leave',
				label: 'Member Left / Kicked',
				description: 'Logs when a member leaves or is removed from the server.'
			},
			{
				id: 'member_role',
				label: 'Member Roles Updated',
				description: 'Logs when roles are added to or removed from a member.'
			},
			{
				id: 'member_nick',
				label: 'Nickname Changed',
				description: 'Logs member nickname changes.'
			}
		]
	},
	{
		name: 'Message Events',
		description: 'Monitor deleted, edited, and purged chat messages',
		icon: '💬',
		events: [
			{
				id: 'message_delete',
				label: 'Message Deleted',
				description:
					'Logs deleted messages including text content and attachments.'
			},
			{
				id: 'message_edit',
				label: 'Message Edited',
				description: 'Logs before and after text when a message is modified.'
			},
			{
				id: 'message_purge',
				label: 'Messages Purged / Cleaned',
				description: 'Logs bulk message deletion events.'
			}
		]
	},
	{
		name: 'Channel Events',
		description: 'Track channel creations, deletions, and modifications',
		icon: '📁',
		events: [
			{
				id: 'channel_create',
				label: 'Channel Created',
				description:
					'Logs when a new text, voice, or category channel is created.'
			},
			{
				id: 'channel_delete',
				label: 'Channel Deleted',
				description: 'Logs when a channel is removed from the server.'
			},
			{
				id: 'channel_update',
				label: 'Channel Modified',
				description:
					'Logs channel renames, topic changes, and permission edits.'
			}
		]
	},
	{
		name: 'Role Events',
		description: 'Track role creations, deletions, and permission updates',
		icon: '🛡️',
		events: [
			{
				id: 'role_create',
				label: 'Role Created',
				description: 'Logs when a new server role is created.'
			},
			{
				id: 'role_delete',
				label: 'Role Deleted',
				description: 'Logs when a server role is deleted.'
			},
			{
				id: 'role_update',
				label: 'Role Updated',
				description: 'Logs changes to role names, colors, and permissions.'
			}
		]
	},
	{
		name: 'Voice Events',
		description: 'Track member voice channel activity',
		icon: '🔊',
		events: [
			{
				id: 'voice_join',
				label: 'Voice Channel Joined',
				description: 'Logs when a member connects to a voice channel.'
			},
			{
				id: 'voice_leave',
				label: 'Voice Channel Left',
				description: 'Logs when a member disconnects from voice.'
			},
			{
				id: 'voice_move',
				label: 'Voice Channel Switched',
				description:
					'Logs when a member moves from one voice channel to another.'
			}
		]
	},
	{
		name: 'Moderation Actions',
		description: 'Audit kicks, bans, and timeouts executed by staff',
		icon: '⚖️',
		events: [
			{
				id: 'mod_ban',
				label: 'Member Banned',
				description: 'Logs when a user is banned from the server.'
			},
			{
				id: 'mod_unban',
				label: 'Member Unbanned',
				description: 'Logs when a user ban is revoked.'
			},
			{
				id: 'mod_timeout',
				label: 'Member Timed Out',
				description: 'Logs when a member is placed in or removed from timeout.'
			},
			{
				id: 'mod_kick',
				label: 'Member Kicked',
				description: 'Logs moderation kick actions.'
			}
		]
	}
];

export const ALL_EVENT_IDS = LOG_CATEGORIES.flatMap(c =>
	c.events.map(e => e.id)
);

export default function LogEventsForm({
	guildId,
	initialEvents
}: {
	guildId: string;
	initialEvents: string[];
}) {
	// If empty in DB on first load, default all to enabled for best initial UX
	const [selectedEvents, setSelectedEvents] = useState<string[]>(
		initialEvents.length === 0 ? ALL_EVENT_IDS : initialEvents
	);
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	const handleToggleEvent = (eventId: string) => {
		setSelectedEvents(prev =>
			prev.includes(eventId)
				? prev.filter(id => id !== eventId)
				: [...prev, eventId]
		);
	};

	const handleToggleCategory = (category: LogCategory, enableAll: boolean) => {
		const categoryIds = category.events.map(e => e.id);
		setSelectedEvents(prev => {
			if (enableAll) {
				return Array.from(new Set([...prev, ...categoryIds]));
			} else {
				return prev.filter(id => !categoryIds.includes(id));
			}
		});
	};

	const handleEnableAllOverall = () => {
		setSelectedEvents(ALL_EVENT_IDS);
	};

	const handleDisableAllOverall = () => {
		setSelectedEvents([]);
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await updateLogEvents(selectedEvents, guildId);
			toast({
				title: 'Log settings saved',
				description: `Updated event triggers (${selectedEvents.length} of ${ALL_EVENT_IDS.length} active).`
			});
		} catch {
			toast({
				title: 'Error saving log settings',
				description: 'Please try again later.',
				variant: 'destructive'
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Top action bar */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-800 bg-gray-900/60">
				<div>
					<h4 className="text-base font-semibold text-white">
						📊 Active Log Triggers: {selectedEvents.length} /{' '}
						{ALL_EVENT_IDS.length}
					</h4>
					<p className="text-xs text-gray-400">
						Select which specific Discord server events are dispatched to your
						log channel.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="text-xs border-gray-700"
						onClick={handleEnableAllOverall}
					>
						Enable All
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="text-xs border-gray-700"
						onClick={handleDisableAllOverall}
					>
						Disable All
					</Button>
					<Button
						type="button"
						size="sm"
						disabled={isSaving}
						onClick={handleSave}
						className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
					>
						{isSaving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</div>

			{/* Category Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{LOG_CATEGORIES.map(category => {
					const activeCount = category.events.filter(e =>
						selectedEvents.includes(e.id)
					).length;
					const allActive = activeCount === category.events.length;

					return (
						<div
							key={category.name}
							className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/40 p-5 shadow-sm"
						>
							<div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4">
								<div className="flex items-center gap-2.5">
									<span className="text-xl">{category.icon}</span>
									<div>
										<h5 className="text-sm font-semibold text-white">
											{category.name}
										</h5>
										<p className="text-xs text-gray-400">
											{category.description}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-gray-800">
										{activeCount}/{category.events.length}
									</span>
									<button
										type="button"
										onClick={() => handleToggleCategory(category, !allActive)}
										className="text-xs text-blue-400 hover:underline"
									>
										{allActive ? 'Disable all' : 'Enable all'}
									</button>
								</div>
							</div>

							<div className="flex flex-col gap-3.5 flex-1">
								{category.events.map(event => {
									const isChecked = selectedEvents.includes(event.id);
									return (
										<div
											key={event.id}
											className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-black/30 border border-gray-800/50 hover:border-gray-700/80 transition-colors"
										>
											<div className="flex-1 pr-2">
												<label
													htmlFor={event.id}
													className="text-xs font-medium text-gray-200 cursor-pointer block"
												>
													{event.label}
												</label>
												<p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
													{event.description}
												</p>
											</div>
											<Switch
												id={event.id}
												checked={isChecked}
												onCheckedChange={() => handleToggleEvent(event.id)}
											/>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			{/* Floating Bottom Action Bar */}
			<div className="sticky bottom-4 z-10 flex items-center justify-between p-4 rounded-xl border border-indigo-900/60 bg-gray-950/95 backdrop-blur shadow-2xl">
				<span className="text-xs text-gray-300">
					Remember to save your settings after making changes.
				</span>
				<Button
					type="button"
					disabled={isSaving}
					onClick={handleSave}
					className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
				>
					{isSaving ? 'Saving...' : 'Save Log Settings'}
				</Button>
			</div>
		</div>
	);
}
