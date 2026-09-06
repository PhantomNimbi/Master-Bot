import { auth } from '@master-bot/auth';
import { prisma } from '@master-bot/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';
import ReminderForm from './reminder-form';
import RemindersList from './reminders-list';

export default async function RemindersPage() {
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
		<div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
			<div className="max-w-5xl mx-auto flex flex-col gap-8">
				{/* Top Navigation Bar */}
				<div className="flex items-center justify-between">
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						<span>Back to Dashboard</span>
					</Link>
				</div>

				{/* Header */}
				<div className="flex flex-col gap-2 border-b border-slate-800 pb-6">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400">
							<Bell className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
								Reminders Manager
							</h1>
							<p className="text-sm text-slate-400 mt-0.5">
								Create and manage custom timed reminders with dynamic format
								tags and Discord notifications.
							</p>
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="flex flex-col gap-8">
					<ReminderForm username={session.user.name ?? 'Member'} />
					<RemindersList initialReminders={reminders} />
				</div>
			</div>
		</div>
	);
}
