'use client';

import { useState } from 'react';
import { deleteReminder } from './actions';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';
import { Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';

export interface ReminderItem {
	id: number;
	event: string;
	description: string | null;
	dateTime: string;
	repeat: string | null;
}

export default function RemindersList({
	initialReminders
}: {
	initialReminders: ReminderItem[];
}) {
	const [reminders, setReminders] = useState(initialReminders);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const { toast } = useToast();

	const handleDelete = async (id: number, eventName: string) => {
		setDeletingId(id);
		try {
			const formData = new FormData();
			formData.append('id', id.toString());
			await deleteReminder(formData);

			setReminders(prev => prev.filter(r => r.id !== id));
			toast({
				title: 'Reminder deleted',
				description: `Removed "${eventName}" from your scheduled reminders.`
			});
		} catch (err: any) {
			toast({
				title: 'Failed to delete reminder',
				description: err?.message || 'Please try again later.',
				variant: 'destructive'
			});
		} finally {
			setDeletingId(null);
		}
	};

	if (reminders.length === 0) {
		return (
			<div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
				<Clock className="h-10 w-10 text-slate-600 mb-3" />
				<h4 className="text-base font-medium text-white">
					No active reminders
				</h4>
				<p className="text-sm text-slate-400 mt-1 max-w-sm">
					You don&apos;t have any scheduled reminders. Use the form above to
					schedule your first reminder with custom formatting!
				</p>
			</div>
		);
	}

	return (
		<div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
			<div className="p-4 border-b border-slate-800 flex items-center justify-between">
				<h3 className="text-base font-semibold text-white flex items-center gap-2">
					<Calendar className="h-4 w-4 text-blue-400" />
					Your Scheduled Reminders ({reminders.length})
				</h3>
			</div>

			<div className="divide-y divide-slate-800/60">
				{reminders.map(item => {
					const date = new Date(item.dateTime);
					const isPast = !isNaN(date.getTime()) && date.getTime() <= Date.now();
					const dateStr = !isNaN(date.getTime())
						? date.toLocaleDateString('en-US', {
								weekday: 'short',
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							})
						: 'Invalid Date';

					const timeStr = !isNaN(date.getTime())
						? date.toLocaleTimeString('en-US', {
								hour: 'numeric',
								minute: '2-digit',
								hour12: true
							})
						: '';

					return (
						<div
							key={item.id}
							className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
						>
							<div className="flex flex-col gap-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="text-sm font-semibold text-white">
										{item.event}
									</span>
									{isPast ? (
										<span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/50">
											<AlertCircle className="h-3 w-3" /> Due now / delivering
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/50">
											<Clock className="h-3 w-3" /> Scheduled
										</span>
									)}
								</div>

								<div className="flex items-center gap-3 text-xs text-slate-400">
									<span>
										📅 {dateStr} at {timeStr}
									</span>
								</div>

								{item.description && (
									<p className="text-xs text-slate-300 mt-1 bg-black/30 p-2 rounded border border-slate-800 font-mono">
										{item.description}
									</p>
								)}
							</div>

							<div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={deletingId === item.id}
									onClick={() => handleDelete(item.id, item.event)}
									className="border-red-900/40 text-red-400 hover:bg-red-950 hover:text-red-300 text-xs h-8"
								>
									<Trash2 className="h-3.5 w-3.5 mr-1" />
									{deletingId === item.id ? 'Deleting...' : 'Delete'}
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
