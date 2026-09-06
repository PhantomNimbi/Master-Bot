'use client';

import { useState } from 'react';
import { setTicketMessage } from './actions';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';

interface TicketFormProps {
	guildId: string;
	initialMessage: string;
	guildName: string;
}

const DEFAULT_TICKET_MESSAGE =
	'👋 Hello {user}, thank you for contacting support in **{server}**!\n\n' +
	'A support representative or moderator will be with you shortly. In the meantime, please provide as much detail as possible:\n' +
	'• A clear description of your question, inquiry, or issue\n' +
	'• Any relevant screenshots, error messages, or transaction IDs\n' +
	'• Any steps you have already tried to resolve the problem\n\n' +
	'To close this ticket once your inquiry is resolved, click the **Close Ticket** button below.';

const TICKET_TAGS = [
	{
		tag: '{user}',
		alias: '{mention}',
		desc: 'Mentions the ticket creator',
		example: '@TicketCreator'
	},
	{
		tag: '{username}',
		alias: null,
		desc: 'Plain username (no ping)',
		example: 'TicketCreator'
	},
	{
		tag: '{server}',
		alias: '{guild}',
		desc: 'Name of your Discord server',
		example: 'My Community'
	}
];

export default function TicketMessageForm({
	guildId,
	initialMessage,
	guildName
}: TicketFormProps) {
	const [message, setMessage] = useState(initialMessage || '');
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	const handleInsertTag = (tag: string) => {
		setMessage(prev => (prev ? `${prev} ${tag}` : tag));
	};

	const handleResetToDefault = () => {
		setMessage(DEFAULT_TICKET_MESSAGE);
	};

	const generatePreview = (template: string) => {
		const raw =
			template && template.trim().length > 0
				? template
				: DEFAULT_TICKET_MESSAGE;
		return raw
			.replace(/\{user\}|\{mention\}/g, '@TicketCreator')
			.replace(/\{username\}/g, 'TicketCreator')
			.replace(/\{server\}|\{guild\}/g, guildName || 'My Server');
	};

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append('guildId', guildId);
			formData.append('message', message);
			await setTicketMessage(formData);
			toast({
				title: 'Ticket message saved successfully',
				description:
					'New support ticket threads will receive this welcome message.'
			});
		} catch {
			toast({
				title: 'Error saving ticket message',
				description: 'Please try again later.',
				variant: 'destructive'
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Tag Guide Card */}
			<div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 shadow-sm">
				<h4 className="text-lg font-medium text-white mb-2">
					🏷️ Dynamic Placeholders & Formatting Tags
				</h4>
				<p className="text-sm text-gray-400 mb-4">
					Use the tags below in your ticket greeting. When a member opens a
					ticket, Master-Bot automatically replaces each tag with real-time
					member and server information:
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
					{TICKET_TAGS.map(item => (
						<div
							key={item.tag}
							className="flex flex-col justify-between p-3 rounded-lg bg-black/50 border border-gray-800 hover:border-blue-500/50 transition-colors"
						>
							<div>
								<div className="flex items-center gap-2">
									<code className="text-blue-400 font-mono text-sm font-semibold">
										{item.tag}
									</code>
									{item.alias && (
										<span className="text-xs text-gray-500 font-mono">
											or {item.alias}
										</span>
									)}
								</div>
								<p className="text-xs text-gray-400 mt-1">{item.desc}</p>
								<p className="text-xs text-gray-500 italic mt-0.5">
									Outputs: {item.example}
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="mt-3 text-xs border-gray-700 hover:bg-blue-600 hover:text-white"
								onClick={() => handleInsertTag(item.tag)}
							>
								+ Insert
							</Button>
						</div>
					))}
				</div>

				<div className="rounded-lg bg-blue-950/30 border border-blue-800/40 p-3 text-xs text-blue-300 flex flex-col gap-1">
					<span className="font-semibold text-blue-200">
						✨ Discord Markdown Supported:
					</span>
					<span>
						• <code>**bold**</code> for bold text, <code>*italics*</code> for
						italic, <code>__underline__</code> for underlined text
					</span>
					<span>
						• <code>&gt; Quote</code> for block quotes, <code>`code`</code> for
						monospace highlight, <code>• bullet</code> for bullet lists
					</span>
				</div>
			</div>

			{/* Custom Message Editor */}
			<form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<label
						htmlFor="ticket-text"
						className="text-sm font-medium text-gray-200"
					>
						Custom Ticket Welcome Message
					</label>
					<button
						type="button"
						onClick={handleResetToDefault}
						className="text-xs text-blue-400 hover:underline"
					>
						Reset to default professional greeting
					</button>
				</div>

				<textarea
					id="ticket-text"
					name="message"
					value={message}
					onChange={e => setMessage(e.target.value)}
					placeholder={DEFAULT_TICKET_MESSAGE}
					rows={8}
					className="block w-full bg-black/80 outline-none overflow-auto resize-none p-4 text-white rounded-lg border border-gray-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-sans text-sm"
				/>

				{/* Live Preview Box */}
				<div className="rounded-lg border border-gray-800 bg-black/40 p-4">
					<span className="text-xs uppercase font-semibold text-gray-500 tracking-wider block mb-1">
						💬 Live Ticket Thread Embed Preview
					</span>
					<div className="p-4 rounded-lg bg-[#2b2d31] border border-[#3f4147] text-[#dbdee1] font-sans text-sm space-y-3">
						<div className="border-l-4 border-indigo-500 pl-3 space-y-2">
							<div className="font-bold text-white text-base">
								🎫 Support Ticket: TicketCreator
							</div>
							<div className="text-xs whitespace-pre-wrap leading-relaxed text-gray-200">
								{generatePreview(message)}
							</div>
							<div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-700/50">
								<div>
									<span className="text-gray-400">👤 Opened By:</span>
									<p className="font-medium text-white">
										TicketCreator (@TicketCreator)
									</p>
								</div>
								<div>
									<span className="text-gray-400">🕒 Opened At:</span>
									<p className="font-medium text-white">Just now</p>
								</div>
							</div>
						</div>

						<div className="pt-2">
							<button
								type="button"
								className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
							>
								🔒 Close Ticket
							</button>
						</div>
					</div>
				</div>

				<div className="flex gap-3">
					<Button type="submit" disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save Ticket Message'}
					</Button>
				</div>
			</form>
		</div>
	);
}
