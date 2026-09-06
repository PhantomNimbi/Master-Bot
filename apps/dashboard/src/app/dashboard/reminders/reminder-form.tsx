'use client';

import { useState } from 'react';
import { createReminder } from './actions';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';
import { PlusCircle, Tag, Clock } from 'lucide-react';

interface ReminderFormProps {
	username: string;
}

const TAGS = [
	{
		tag: '{user}',
		alias: '{mention}',
		desc: 'Mentions you directly',
		example: '@User'
	},
	{
		tag: '{username}',
		alias: null,
		desc: 'Your plain username',
		example: 'User'
	},
	{
		tag: '{event}',
		alias: null,
		desc: 'The title of this event',
		example: 'Team Meeting'
	},
	{
		tag: '{date}',
		alias: null,
		desc: 'Formatted date of the reminder',
		example: 'August 31, 2026'
	},
	{
		tag: '{time}',
		alias: null,
		desc: 'Formatted time of the reminder',
		example: '7:30 PM'
	},
	{
		tag: '{countdown}',
		alias: '{relative}',
		desc: 'Relative countdown timestamp',
		example: 'in 2 hours'
	}
];

export default function ReminderForm({ username }: ReminderFormProps) {
	const [event, setEvent] = useState('');
	const [description, setDescription] = useState('');
	// Default to 1 hour in the future
	const defaultDate = new Date(Date.now() + 60 * 60 * 1000);
	const defaultIso = new Date(
		defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000
	)
		.toISOString()
		.slice(0, 16);

	const [dateTime, setDateTime] = useState(defaultIso);
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	const handleInsertTag = (tag: string) => {
		setDescription(prev => (prev ? `${prev} ${tag}` : tag));
	};

	const generatePreview = (text: string) => {
		if (!text) return 'No additional notes provided.';
		const targetDate = new Date(dateTime);
		const dateStr = !isNaN(targetDate.getTime())
			? targetDate.toLocaleDateString('en-US', {
					month: 'long',
					day: 'numeric',
					year: 'numeric'
				})
			: 'August 31, 2026';
		const timeStr = !isNaN(targetDate.getTime())
			? targetDate.toLocaleTimeString('en-US', {
					hour: 'numeric',
					minute: '2-digit',
					hour12: true
				})
			: '7:30 PM';

		return text
			.replace(/\{user\}|\{mention\}/gi, `@${username || 'Member'}`)
			.replace(/\{username\}/gi, username || 'Member')
			.replace(/\{event\}/gi, event || 'My Scheduled Event')
			.replace(/\{date\}/gi, dateStr)
			.replace(/\{time\}/gi, timeStr)
			.replace(/\{countdown\}|\{relative\}|\{timestamp\}/gi, 'in 1 hour');
	};

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!event.trim()) {
			return toast({
				title: 'Event title required',
				description: 'Please provide a name or title for your reminder.',
				variant: 'destructive'
			});
		}

		if (!dateTime) {
			return toast({
				title: 'Date and time required',
				description: 'Please select when you want to be reminded.',
				variant: 'destructive'
			});
		}

		const parsedDate = new Date(dateTime);
		if (isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now()) {
			return toast({
				title: 'Invalid reminder time',
				description: 'Please select a future date and time.',
				variant: 'destructive'
			});
		}

		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append('event', event);
			formData.append('description', description);
			formData.append('dateTime', dateTime);

			await createReminder(formData);
			toast({
				title: '⏰ Reminder scheduled successfully',
				description: `You will be notified for "${event}".`
			});
			setEvent('');
			setDescription('');
		} catch (err: any) {
			toast({
				title: 'Failed to schedule reminder',
				description: err?.message || 'Please try again later.',
				variant: 'destructive'
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
			<div>
				<h3 className="text-xl font-semibold text-white flex items-center gap-2">
					<PlusCircle className="h-5 w-5 text-blue-400" />
					Schedule New Reminder
				</h3>
				<p className="text-sm text-slate-400 mt-1">
					Set up a timed notification. Master-Bot will deliver a formatted
					reminder to your Discord DMs or server channels on schedule.
				</p>
			</div>

			{/* Tag Guide Card */}
			<div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
				<div className="flex items-center gap-2 mb-2">
					<Tag className="h-4 w-4 text-blue-400" />
					<h4 className="text-sm font-medium text-white">
						Dynamic Formatting Tags Supported
					</h4>
				</div>
				<p className="text-xs text-slate-400 mb-3">
					Click to insert any of the real-time placeholder tags into your
					reminder description:
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
					{TAGS.map(item => (
						<div
							key={item.tag}
							className="flex items-center justify-between p-2.5 rounded-md bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-colors"
						>
							<div>
								<div className="flex items-center gap-1.5">
									<code className="text-blue-400 font-mono text-xs font-semibold">
										{item.tag}
									</code>
									{item.alias && (
										<span className="text-[10px] text-slate-500 font-mono">
											or {item.alias}
										</span>
									)}
								</div>
								<p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="text-[11px] h-7 px-2 border-slate-700 hover:bg-blue-600 hover:text-white"
								onClick={() => handleInsertTag(item.tag)}
							>
								+ Insert
							</Button>
						</div>
					))}
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="reminder-event"
							className="text-sm font-medium text-slate-200"
						>
							Event Name / Title <span className="text-red-400">*</span>
						</label>
						<input
							id="reminder-event"
							type="text"
							value={event}
							onChange={e => setEvent(e.target.value)}
							placeholder="e.g. Project presentation, Laundry, Guild meeting"
							required
							className="w-full bg-black/60 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="reminder-datetime"
							className="text-sm font-medium text-slate-200 flex items-center gap-1.5"
						>
							<Clock className="h-4 w-4 text-blue-400" />
							Remind Date & Time <span className="text-red-400">*</span>
						</label>
						<input
							id="reminder-datetime"
							type="datetime-local"
							value={dateTime}
							onChange={e => setDateTime(e.target.value)}
							required
							className="w-full bg-black/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="reminder-desc"
						className="text-sm font-medium text-slate-200"
					>
						Custom Notes & Description (Optional — supports tags and markdown)
					</label>
					<textarea
						id="reminder-desc"
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder="Hey {user}, make sure to bring the documents for {event} at {time}!"
						rows={3}
						className="w-full bg-black/60 border border-slate-800 rounded-lg p-3.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
					/>
				</div>

				{/* Real-Time Live Preview */}
				<div className="rounded-lg border border-slate-800 bg-black/40 p-4">
					<span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider block mb-2">
						💬 Real-time Discord Notification Preview
					</span>
					<div className="p-3.5 rounded-lg bg-[#313338] text-[#dbdee1] border border-[#3f4147] flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
							<span>🔔</span>
							<span>Scheduled Reminder</span>
						</div>
						<div className="text-xs text-[#949ba4]">
							Hey{' '}
							<span className="text-blue-400 font-medium">
								@{username || 'Member'}
							</span>
							, here is your reminder for{' '}
							<span className="font-semibold text-white">
								{event || 'My Scheduled Event'}
							</span>
							!
						</div>
						<div className="mt-1 p-2.5 rounded bg-[#2b2d31] border border-[#35373c] text-xs space-y-1">
							<div>
								<span className="text-slate-400 font-medium">Event: </span>
								<span className="text-white font-semibold">
									{event || 'My Scheduled Event'}
								</span>
							</div>
							<div>
								<span className="text-slate-400 font-medium">Notes: </span>
								<span className="text-slate-200 italic">
									{generatePreview(description)}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={isSaving}
						className="bg-blue-600 hover:bg-blue-500 text-white"
					>
						{isSaving ? 'Scheduling...' : '⏰ Schedule Reminder'}
					</Button>
				</div>
			</form>
		</div>
	);
}
