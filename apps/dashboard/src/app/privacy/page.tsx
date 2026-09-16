import Link from 'next/link';
import Logo from '~/components/logo';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
	title: 'Privacy Policy - Master-Bot',
	description: 'Privacy policy and data collection standards for Master-Bot.'
};

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
			<header className="px-6 py-4 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/70 sticky top-0 z-50 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Logo size="medium" />
					<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
						Privacy Policy
					</span>
				</div>
				<Link
					href="/"
					className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					<span>Back to Home</span>
				</Link>
			</header>

			<main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 text-left">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
						<ShieldCheck className="w-5 h-5" />
					</div>
					<div>
						<h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
						<p className="text-sm text-slate-400">Last Updated: September 16, 2026</p>
					</div>
				</div>

				<div className="prose prose-invert prose-indigo max-w-none space-y-8 text-slate-300 leading-relaxed text-sm">
					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
						<p className="mb-3">
							Master-Bot operates under a minimal-data collection principle. We only collect identifiers strictly required for server management and utility features:
						</p>
						<ul className="list-disc pl-5 space-y-1.5 text-slate-300">
							<li><strong className="text-slate-100">User Data:</strong> Discord User ID, username, and avatar hash (for dashboard sessions and audit logs).</li>
							<li><strong className="text-slate-100">Guild Data:</strong> Discord Guild ID, guild name, owner ID, and server preferences (log channel, ticket manager role, volume).</li>
							<li><strong className="text-slate-100">Custom Content:</strong> Playlists created via <code>/create-playlist</code>, support ticket thread IDs, scheduled reminder messages, and Twitch notification bindings.</li>
							<li><strong className="text-slate-100">Zero Message Content Recording:</strong> We do NOT read, monitor, or record private chat messages or voice audio packets.</li>
						</ul>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">2. How Data is Used</h2>
						<p>
							Stored information is used exclusively to operate Master-Bot features: resolving music playback queues, emitting audit logs to designated channels, dispatching scheduled reminders, managing support ticket threads, and authenticating server managers on this dashboard.
						</p>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">3. Data Retention & Automatic Cleanup</h2>
						<p className="mb-3">
							Data is retained only as long as Master-Bot remains in your server.
						</p>
						<ul className="list-disc pl-5 space-y-1.5 text-slate-300">
							<li><strong className="text-slate-100">Member Leave Purge:</strong> When a user departs a guild, Master-Bot automatically cascades and deletes the user&apos;s tickets, temporary channels, playlists, and reminders in that guild.</li>
							<li><strong className="text-slate-100">Manual Deletion:</strong> Users can remove custom playlists anytime with <code>/delete-playlist</code> or delete reminders.</li>
						</ul>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">4. Third-Party Integrations</h2>
						<p>
							Master-Bot connects with external APIs including Discord API, YouTube (via authorized device-flow OAuth), Spotify (metadata resolution), Twitch (live alerts), and Klipy/NewsAPI. We do NOT sell, lease, or monetize any user or server data to advertisers or third parties.
						</p>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">5. Inquiries & Data Rights</h2>
						<p>
							For inquiries, data export requests, or manual data removal, please visit our repository issue tracker at{' '}
							<a
								href="https://github.com/galnir/Master-Bot/issues"
								target="_blank"
								rel="noopener noreferrer"
								className="text-indigo-400 hover:underline"
							>
								github.com/galnir/Master-Bot/issues
							</a>.
						</p>
					</section>
				</div>
			</main>

			<footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 max-w-4xl mx-auto w-full flex items-center justify-between">
				<span>© {new Date().getFullYear()} Master-Bot. All rights reserved.</span>
				<div className="flex items-center gap-4">
					<Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
					<Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
				</div>
			</footer>
		</div>
	);
}
