'use client';

import { useState } from 'react';
import { setWelcomeMessage } from './actions';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';

interface WelcomeFormProps {
	guildId: string;
	initialMessage: string;
	guildName: string;
}

const DEFAULT_TEMPLATE =
	'👋 Welcome {user} to **{server}**! You are member #{position}.';

const TAGS = [
	{
		tag: '{user}',
		alias: '{mention}',
		desc: 'Mentions the joining member',
		example: '@NewMember'
	},
	{
		tag: '{username}',
		alias: null,
		desc: 'Plain username (no ping)',
		example: 'NewMember'
	},
	{
		tag: '{server}',
		alias: '{guild}',
		desc: 'Name of your Discord server',
		example: 'My Community'
	},
	{
		tag: '{position}',
		alias: '{memberCount}',
		desc: 'Member join number / total count',
		example: '142'
	}
];

export default function WelcomeMessageForm({
	guildId,
	initialMessage,
	guildName
}: WelcomeFormProps) {
	const [message, setMessage] = useState(initialMessage || '');
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	const handleInsertTag = (tag: string) => {
		setMessage(prev => (prev ? `${prev} ${tag}` : tag));
	};

	const handleResetToDefault = () => {
		setMessage(DEFAULT_TEMPLATE);
	};

	const generatePreview = (template: string) => {
		const raw =
			template && template.trim().length > 0
				? template
				: DEFAULT_TEMPLATE;
		return raw
			.replace(/\{user\}|\{mention\}/g, '@Member')
			.replace(/\{username\}/g, 'Member')
			.replace(/\{server\}|\{guild\}/g, guildName || 'My Server')
			.replace(/\{memberCount\}|\{position\}/g, '142');
	};

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append('guildId', guildId);
			formData.append('message', message);
			await setWelcomeMessage(formData);
			toast({
				title: 'Welcome message saved successfully',
				description: 'New members will now receive this customized greeting.'
			});
		} catch {
			toast({
				title: 'Error saving welcome message',
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
					Use the tags below in your custom message. When a user joins,
					Master-Bot automatically replaces each tag with real-time member
					and server information:
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
					{TAGS.map(item => (
						<div
							key={item.tag}
							className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-gray-800 hover:border-blue-500/50 transition-colors"
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
								<p className="text-xs text-gray-400 mt-1">
									{item.desc}
								</p>
								<p className="text-xs text-gray-500 italic mt-0.5">
									Outputs: {item.example}
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="text-xs border-gray-700 hover:bg-blue-600 hover:text-white"
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
						• <code>**bold**</code> for bold text,{' '}
						<code>*italics*</code> for italic,{' '}
						<code>__underline__</code> for underlined text
					</span>
					<span>
						• <code>&gt; Quote</code> for block quotes,{' '}
						<code>`code`</code> for monospace highlight
					</span>
				</div>
			</div>

			{/* Custom Message Editor */}
			<form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<label
						htmlFor="welcome-text"
						className="text-sm font-medium text-gray-200"
					>
						Custom Welcome Message Text
					</label>
					<button
						type="button"
						onClick={handleResetToDefault}
						className="text-xs text-blue-400 hover:underline"
					>
						Reset to default greeting
					</button>
				</div>

				<textarea
					id="welcome-text"
					name="message"
					value={message}
					onChange={e => setMessage(e.target.value)}
					placeholder={DEFAULT_TEMPLATE}
					rows={4}
					className="block w-full bg-black/80 outline-none overflow-auto resize-none p-4 text-white rounded-lg border border-gray-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-sans"
				/>

				{/* Live Preview Box */}
				<div className="rounded-lg border border-gray-800 bg-black/40 p-4">
					<span className="text-xs uppercase font-semibold text-gray-500 tracking-wider block mb-1">
						💬 Real-time Discord Preview
					</span>
					<div className="p-3 rounded bg-[#313338] text-[#dbdee1] text-sm font-sans whitespace-pre-wrap border border-[#3f4147]">
						{generatePreview(message)}
					</div>
				</div>

				<div className="flex gap-3">
					<Button type="submit" disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save Welcome Message'}
					</Button>
				</div>
			</form>
		</div>
	);
}

