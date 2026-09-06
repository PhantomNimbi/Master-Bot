'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	LayoutDashboard,
	Terminal,
	MessageCircle,
	FileText,
	Ticket,
	Bell,
	Music2,
	Send,
	Layers,
	Activity,
	ArrowLeft
} from 'lucide-react';
import Logo from '~/components/logo';

export default function Sidebar({ server_id }: { server_id: string }) {
	const pathname = usePathname();

	const links = [
		{
			href: `/dashboard/${server_id}`,
			label: 'Overview',
			icon: LayoutDashboard,
			exact: true
		},
		{
			href: `/dashboard/${server_id}/commands`,
			label: 'Commands',
			icon: Terminal,
			exact: false
		},
		{
			href: `/dashboard/${server_id}/welcome-message`,
			label: 'Welcome Message',
			icon: MessageCircle,
			exact: false
		},
		{
			href: `/dashboard/${server_id}/log-channel`,
			label: 'Log Channel',
			icon: FileText,
			exact: false
		},
		{
			href: `/dashboard/${server_id}/tickets`,
			label: 'Support Tickets',
			icon: Ticket,
			exact: false
		},
		{
			href: `/dashboard/${server_id}/reminders`,
			label: 'Reminders',
			icon: Bell,
			exact: false
		},
		{
			href: '/dashboard/music',
			label: 'Music Studio',
			icon: Music2,
			exact: false
		},
		{
			href: '/dashboard/broadcast',
			label: 'Broadcaster',
			icon: Send,
			exact: false
		},
		{
			href: '/dashboard/integrations',
			label: 'Twitch Streams',
			icon: Layers,
			exact: false
		},
		{
			href: '/dashboard/system',
			label: 'Diagnostics',
			icon: Activity,
			exact: false
		}
	];

	return (
		<aside className="w-56 flex flex-col justify-between h-full py-2">
			<div className="flex flex-col gap-8">
				<div className="flex items-center justify-center">
					<Link href={`/dashboard/${server_id}`}>
						<Logo size="medium" />
					</Link>
				</div>

				<nav className="flex flex-col gap-1.5">
					{links.map(link => {
						const isActive = link.exact
							? pathname === link.href
							: pathname?.startsWith(link.href);

						return (
							<Link
								key={link.href}
								href={link.href}
								className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
									isActive
										? 'bg-slate-700/80 text-white font-semibold shadow-sm'
										: 'text-slate-400 hover:text-white hover:bg-slate-800/60'
								}`}
							>
								<link.icon className="h-5 w-5 shrink-0" />
								<span>{link.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="pt-4 border-t border-slate-700/50">
				<Link
					href="/dashboard"
					className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
				>
					<ArrowLeft className="h-5 w-5 shrink-0" />
					<span>Switch Server</span>
				</Link>
			</div>
		</aside>
	);
}
