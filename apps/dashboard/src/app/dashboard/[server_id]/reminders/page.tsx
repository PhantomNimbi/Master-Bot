import { auth } from '@master-bot/auth';
import { prisma } from '@master-bot/db';
import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import ReminderForm from '../../reminders/reminder-form';
import RemindersList from '../../reminders/reminders-list';

export default async function ServerRemindersPage() {
	const session = await auth();

	if (!session?.user) {
		redirect('/');
	}

	const discordId = (session.user as any).discordId || session.user.id;
	const reminders = await prisma.reminder.findMany({
		where: {
			userId: discordId
		},
		select: {
			id: true,
			event: true,
			description: true,
			dateTime: true,
			repeat: true
		},
		orderBy: {
			dateTime: 'asc'
		}
	});

	return (
		<div className="flex flex-col gap-6 max-w-5xl">
			{/* Header */}
			<div className="flex flex-col gap-2 border-b border-slate-700/60 pb-5">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
						<Bell className="h-6 w-6" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-white tracking-tight">
							Reminders Manager
						</h1>
						<p className="text-sm text-slate-400 mt-0.5">
							Create and manage timed notifications with dynamic formatting tags
							and real-time preview.
						</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-col gap-8">
				<ReminderForm username={session.user.name ?? 'Member'} />
				<RemindersList initialReminders={reminders} />
			</div>
		</div>
	);
}
