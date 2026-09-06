import Link from 'next/link';
import { auth } from '@master-bot/auth';
import { redirect } from 'next/navigation';
import { Send, ArrowLeft, Radio } from 'lucide-react';
import BroadcastClient from './broadcast-client';

export default async function BroadcastPage() {
	const session = await auth();

	if (!session) {
		redirect('/');
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
			{/* Top Bar */}
			<header className="py-4 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard"
						className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Dashboard</span>
					</Link>
					<span className="text-slate-700">/</span>
					<div className="flex items-center gap-2">
						<Send className="w-5 h-5 text-indigo-400" />
						<h1 className="text-lg font-bold text-white">
							Embed Broadcaster Studio
						</h1>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
						<Radio className="w-3.5 h-3.5" />
						WYSIWYG Live Renderer
					</span>
				</div>
			</header>

			{/* Studio Content */}
			<main className="flex-1 p-6 max-w-7xl mx-auto w-full">
				<BroadcastClient />
			</main>
		</div>
	);
}
