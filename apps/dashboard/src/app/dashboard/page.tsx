import Link from 'next/link';
import GuildsList from './guilds';
import { auth } from '@master-bot/auth';
import { redirect } from 'next/navigation';

export default async function DashboardIndexPage() {
	const session = await auth();

	if (!session) {
		redirect('/');
	}

	return (
		<div className="bg-slate-900 min-h-screen">
			<header className="py-4 px-6 flex items-center justify-between border-b border-slate-800">
				<Link href="/">
					<h3 className="text-slate-300 hover:text-white transition-colors">
						← Go back
					</h3>
				</Link>
				<Link
					href="/dashboard/reminders"
					className="px-3.5 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
				>
					<span>⏰ My Reminders</span>
				</Link>
			</header>
			<main className="flex flex-col items-center justify-center mx-80">
				<h1 className="text-white text-5xl font-semibold mb-10">
					Select a guild
				</h1>
				<GuildsList />
			</main>
		</div>
	);
}
