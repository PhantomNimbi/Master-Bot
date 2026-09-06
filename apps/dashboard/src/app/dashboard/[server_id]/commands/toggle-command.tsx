'use client';

import { Switch } from '~/components/ui/switch';
import { startTransition } from 'react';
import { toggleCommand } from './actions';
import { useToast } from '~/components/ui/use-toast';
import { ToastAction } from '~/components/ui/toast';

export default function CommandToggleSwitch({
	commandEnabled,
	serverId,
	commandId,
	globallyDisabled = false,
	disabledReason
}: {
	commandEnabled: boolean;
	serverId: string;
	commandId: string;
	globallyDisabled?: boolean;
	disabledReason?: string;
}) {
	const { toast } = useToast();

	if (globallyDisabled) {
		return (
			<div className="flex items-center gap-2">
				<Switch
					checked={false}
					disabled={true}
					aria-label={
						disabledReason ?? 'Globally disabled via environment configuration'
					}
				/>
			</div>
		);
	}

	return (
		<Switch
			checked={commandEnabled}
			onCheckedChange={() =>
				startTransition(() =>
					// @ts-ignore
					toggleCommand(serverId, commandId, !commandEnabled).then(() => {
						toast({
							title: `Command ${commandEnabled ? 'disabled' : 'enabled'}`,
							action: <ToastAction altText="Okay">Okay</ToastAction>
						});
					})
				)
			}
		/>
	);
}
