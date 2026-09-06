import Link from 'next/link';
import HeaderButtons from '~/components/header-buttons';
import Logo from '~/components/logo';
import {
	Sparkles,
	Bot,
	Music2,
	Send,
	ShieldCheck,
	Ticket,
	Bell,
	Activity,
	ChevronRight
} from 'lucide-react';

export default function HomePage() {
	const features = [
		{
			icon: Music2,
			title: 'Lavalink v4 Music Studio',
			desc: 'High-fidelity audio streaming with real-time queue management, filters, and personal playlist sync.'
		},
		{
			icon: Send,
			title: 'Live Embed Broadcaster',
			desc: 'Interactive WYSIWYG Discord embed builder for server-wide announcements, patch notes, and news.'
		},
		{
			icon: ShieldCheck,
			title: '18-Event Audit Stream',
			desc: 'Comprehensive moderation trigger logging for message edits, member roles, bans, and voice events.'
		},
		{
			icon: Ticket,
			title: 'Support Ticket Hub',
			desc: 'Category-based ticket creation, customizable staff roles, and searchable transcript archives.'
		},
		{
			icon: Bell,
			title: 'Smart Reminders',
			desc: 'Timezone-aware recurring alerts, channel notifications, and user task schedules.'
		},
		{
			icon: Activity,
			title: 'Cluster Telemetry',
			desc: 'Real-time gateway ping, shard status, database connection metrics, and health diagnostics.'
		}
	];

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
			{/* Navigation Header */}
			<header className="px-6 py-4 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/70 sticky top-0 z-50 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Logo size="medium" />
					<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
						v2.0
					</span>
				</div>

				<div className="flex items-center gap-4">
					<div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
						<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
						All Systems Operational
					</div>
					<HeaderButtons />
				</div>
			</header>

			{/* Hero Section */}
			<main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 max-w-6xl mx-auto w-full text-center">
				<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium mb-8">
					<Sparkles className="w-3.5 h-3.5 text-indigo-400" />
					<span>Enterprise Discord Management & Automation</span>
				</div>

				<h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-none">
					The Ultimate Command Center for{' '}
					<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
						Your Discord Communities
					</span>
				</h1>

				<p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
					Empower your servers with high-fidelity music, automated moderation,
					live embed broadcasters, support ticket suites, and deep telemetry
					diagnostics.
				</p>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="/dashboard"
						className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 group"
					>
						<span>Open Command Center</span>
						<ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
					</Link>

					<a
						href="https://discord.com/oauth2/authorize?client_id=744577840134160456&scope=bot%20applications.commands&permissions=8"
						target="_blank"
						rel="noopener noreferrer"
						className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
					>
						<Bot className="w-4 h-4 text-indigo-400" />
						<span>Invite Master Bot</span>
					</a>
				</div>

				{/* Feature Cards Grid */}
				<div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left w-full">
					{features.map((feat, idx) => (
						<div
							key={idx}
							className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 group shadow-md"
						>
							<div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
								<feat.icon className="w-5 h-5" />
							</div>
							<h3 className="mt-4 text-base font-semibold text-slate-100">
								{feat.title}
							</h3>
							<p className="mt-2 text-sm text-slate-400 leading-relaxed">
								{feat.desc}
							</p>
						</div>
					))}
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto w-full">
				<p>
					© {new Date().getFullYear()} Master-Bot. Open Source Community
					Edition.
				</p>
				<div className="flex items-center gap-6">
					<Link
						href="/dashboard"
						className="hover:text-slate-300 transition-colors"
					>
						Dashboard
					</Link>
					<a
						href="https://github.com/galnir/Master-Bot"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-300 transition-colors"
					>
						GitHub
					</a>
					<a
						href="https://discord.gg"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-300 transition-colors"
					>
						Discord Support
					</a>
				</div>
			</footer>
		</div>
	);
}
