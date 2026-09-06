'use client';

import { useState } from 'react';
import { Send, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '~/utils/api';

export default function BroadcastClient() {
	const [channelId, setChannelId] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const [title, setTitle] = useState<string>('Server Announcement');
	const [description, setDescription] = useState<string>(
		'Welcome everyone! Here is the latest update regarding our community events and patch notes.'
	);
	const [colorHex, setColorHex] = useState<string>('#5865F2');
	const [authorName, setAuthorName] = useState<string>('');
	const [footerText, setFooterText] = useState<string>('Master-Bot System');
	const [statusMessage, setStatusMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	const broadcastMutation = api.broadcast.sendBroadcast.useMutation({
		onSuccess: data => {
			setStatusMessage({
				type: 'success',
				text: `Broadcast sent successfully! Discord Message ID: ${data.messageId}`
			});
		},
		onError: err => {
			setStatusMessage({
				type: 'error',
				text: err.message || 'Failed to dispatch broadcast.'
			});
		}
	});

	const handleSend = () => {
		if (!channelId) {
			setStatusMessage({
				type: 'error',
				text: 'Please enter a target Channel ID.'
			});
			return;
		}

		const colorInt = parseInt(colorHex.replace('#', ''), 16) || 0x5865f2;

		broadcastMutation.mutate({
			guildId: '0',
			channelId,
			content: content || undefined,
			embed: {
				title: title || undefined,
				description: description || undefined,
				color: colorInt,
				author: authorName ? { name: authorName } : undefined,
				footer: footerText ? { text: footerText } : undefined
			}
		});
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Left Column: Embed Form Builder */}
			<div className="space-y-6">
				<div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
					<h2 className="text-lg font-bold text-white flex items-center gap-2">
						<Send className="w-5 h-5 text-indigo-400" />
						<span>Broadcast Configuration</span>
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="target-channel-id"
								className="block text-xs font-semibold text-slate-300 mb-1"
							>
								Target Channel ID *
							</label>
							<input
								id="target-channel-id"
								type="text"
								placeholder="e.g. 102938475610293847"
								value={channelId}
								onChange={e => setChannelId(e.target.value)}
								className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
							/>
						</div>

						<div>
							<label
								htmlFor="accent-color-hex"
								className="block text-xs font-semibold text-slate-300 mb-1"
							>
								Accent Color
							</label>
							<div className="flex items-center gap-2">
								<input
									id="accent-color-picker"
									type="color"
									value={colorHex}
									onChange={e => setColorHex(e.target.value)}
									className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
								/>
								<input
									id="accent-color-hex"
									type="text"
									value={colorHex}
									onChange={e => setColorHex(e.target.value)}
									className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
								/>
							</div>
						</div>
					</div>

					<div>
						<label
							htmlFor="broadcast-plaintext"
							className="block text-xs font-semibold text-slate-300 mb-1"
						>
							Plaintext Message (Optional)
						</label>
						<input
							id="broadcast-plaintext"
							type="text"
							placeholder="e.g. @everyone Announcement!"
							value={content}
							onChange={e => setContent(e.target.value)}
							className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
						/>
					</div>

					<div>
						<label
							htmlFor="broadcast-title"
							className="block text-xs font-semibold text-slate-300 mb-1"
						>
							Embed Title
						</label>
						<input
							id="broadcast-title"
							type="text"
							value={title}
							onChange={e => setTitle(e.target.value)}
							className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
						/>
					</div>

					<div>
						<label
							htmlFor="broadcast-description"
							className="block text-xs font-semibold text-slate-300 mb-1"
						>
							Embed Description
						</label>
						<textarea
							id="broadcast-description"
							rows={4}
							value={description}
							onChange={e => setDescription(e.target.value)}
							className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="broadcast-author"
								className="block text-xs font-semibold text-slate-300 mb-1"
							>
								Author Name
							</label>
							<input
								id="broadcast-author"
								type="text"
								placeholder="e.g. Server Staff"
								value={authorName}
								onChange={e => setAuthorName(e.target.value)}
								className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
							/>
						</div>

						<div>
							<label
								htmlFor="broadcast-footer"
								className="block text-xs font-semibold text-slate-300 mb-1"
							>
								Footer Text
							</label>
							<input
								id="broadcast-footer"
								type="text"
								value={footerText}
								onChange={e => setFooterText(e.target.value)}
								className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
							/>
						</div>
					</div>

					{statusMessage && (
						<div
							className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
								statusMessage.type === 'success'
									? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
									: 'bg-red-500/10 border-red-500/20 text-red-300'
							}`}
						>
							{statusMessage.type === 'success' ? (
								<CheckCircle2 className="w-4 h-4 shrink-0" />
							) : (
								<AlertCircle className="w-4 h-4 shrink-0" />
							)}
							<span>{statusMessage.text}</span>
						</div>
					)}

					<button
						onClick={handleSend}
						disabled={broadcastMutation.isPending}
						className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
					>
						<Send className="w-4 h-4" />
						<span>
							{broadcastMutation.isPending
								? 'Broadcasting...'
								: 'Send Broadcast to Discord'}
						</span>
					</button>
				</div>
			</div>

			{/* Right Column: Live Discord WYSIWYG Preview */}
			<div className="space-y-4">
				<div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
					<Eye className="w-4 h-4 text-indigo-400" />
					<span>Live Discord Client Preview</span>
				</div>

				{/* Discord Message Shell */}
				<div className="p-6 rounded-2xl bg-[#313338] border border-slate-800 shadow-2xl font-sans">
					<div className="flex items-start gap-4">
						{/* Bot Avatar */}
						<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
							MB
						</div>

						<div className="flex-1 min-w-0">
							{/* Bot Header Info */}
							<div className="flex items-center gap-2">
								<span className="font-semibold text-white text-sm">
									Master-Bot
								</span>
								<span className="bg-[#5865f2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
									BOT
								</span>
								<span className="text-[#949ba4] text-xs">
									Today at{' '}
									{new Date().toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</span>
							</div>

							{/* Plain text if any */}
							{content && (
								<p className="text-[#dbdee1] text-sm mt-1 whitespace-pre-wrap">
									{content}
								</p>
							)}

							{/* Rich Embed Card */}
							<div
								className="mt-2.5 rounded border-l-4 bg-[#2b2d31] p-4 max-w-lg shadow-sm"
								style={{ borderLeftColor: colorHex || '#5865F2' }}
							>
								{authorName && (
									<p className="text-xs font-medium text-white mb-1.5">
										{authorName}
									</p>
								)}

								{title && (
									<h4 className="text-sm font-bold text-white mb-1">{title}</h4>
								)}

								{description && (
									<p className="text-xs text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
										{description}
									</p>
								)}

								{footerText && (
									<p className="text-[11px] text-[#949ba4] mt-3 pt-2 border-t border-[#3f4147]">
										{footerText}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
