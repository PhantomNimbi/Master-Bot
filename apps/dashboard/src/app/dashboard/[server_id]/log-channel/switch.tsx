'use client';

import { useToast } from '~/components/ui/use-toast';
import { Switch } from '~/components/ui/switch';
import { toggleLogChannel } from './actions';

export default function LogChannelToggle({
	logChannelEnabled,
	serverId
}: {
	logChannelEnabled: boolean;
	serverId: string;
}) {
	const { toast } = useToast();

	return (
		<div className="flex items-center space-x-2">
			<Switch
				id="log-mode"
				checked={logChannelEnabled}
				onCheckedChange={() => {
					void toggleLogChannel(!logChannelEnabled, serverId).then(() => {
						toast({
							title: `Audit & log channel ${
								logChannelEnabled ? 'disabled' : 'enabled'
							}`
						});
					});
				}}
			/>
		</div>
	);
}
