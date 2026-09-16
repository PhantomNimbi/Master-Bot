import Link from 'next/link';
import Logo from '~/components/logo';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
	title: 'Terms of Service - Master-Bot',
	description: 'Terms of service and user agreements for Master-Bot.'
};

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
			<header className="px-6 py-4 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/70 sticky top-0 z-50 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Logo size="medium" />
					<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
						Terms of Service
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
						<FileText className="w-5 h-5" />
					</div>
					<div>
						<h1 className="text-3xl font-bold text-white">Terms of Service</h1>
						<p className="text-sm text-slate-400">Last Updated: September 16, 2026</p>
					</div>
				</div>

				<div className="prose prose-invert prose-indigo max-w-none space-y-8 text-slate-300 leading-relaxed text-sm">
					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">1. Agreement to Terms</h2>
						<p>
							By inviting Master-Bot to your Discord guild, executing slash commands, or configuring server settings via this dashboard, you agree to comply with and be bound by these Terms of Service, the Discord Terms of Service, and the Discord Community Guidelines.
						</p>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">2. Permitted Use & Server Authority</h2>
						<p className="mb-3">
							To install and manage Master-Bot on a Discord server, you warrant that you possess appropriate server administrative permissions (such as Manage Server or Administrator).
						</p>
						<p>
							Users must meet Discord&apos;s minimum age requirements (13 years or older, or the age of majority in your jurisdiction).
						</p>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">3. Prohibited Conduct</h2>
						<ul className="list-disc pl-5 space-y-1.5 text-slate-300">
							<li>Attempting to exploit, flood, DDoS, or overload the bot infrastructure, APIs, or Discord gateway.</li>
							<li>Using announcement or embed features to broadcast malware, illegal content, harassment, or spam.</li>
							<li>Attempting to bypass role hierarchy checks or access controls.</li>
						</ul>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">4. Audio & Media Streaming</h2>
						<p>
							Audio streaming via Lavalink v4 is provided for real-time entertainment within Discord voice channels. Users are responsible for complying with third-party service terms (including YouTube and Spotify terms). Commercial rebroadcasting is prohibited.
						</p>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">5. Disclaimer & Limitation of Liability</h2>
						<p>
							Master-Bot is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranty of any kind. Developers and operators are not liable for server disputes, moderation decisions, or data loss resulting from use of the bot.
						</p>
					</section>

					<section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
						<h2 className="text-lg font-semibold text-white mb-3">6. Termination</h2>
						<p>
							We reserve the right to blacklist or restrict access to users or guilds that engage in abusive or harmful conduct.
						</p>
					</section>
				</div>
			</main>

			<footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 max-w-4xl mx-auto w-full flex items-center justify-between">
				<span>© {new Date().getFullYear()} Master-Bot. All rights reserved.</span>
				<div className="flex items-center gap-4">
					<Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
					<Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
				</div>
			</footer>
		</div>
	);
}
