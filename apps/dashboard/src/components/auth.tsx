import type { ComponentProps } from 'react';
import type { OAuthProviders } from '@master-bot/auth';
import { signIn, signOut } from '@master-bot/auth';

export function SignIn({
	provider,
	...props
}: { provider: OAuthProviders } & ComponentProps<'button'>) {
	return (
		<form
			action={async () => {
				'use server';
				await signIn(provider);
			}}
		>
			<button {...props} />
		</form>
	);
}

export function SignOut(props: ComponentProps<'button'>) {
	return (
		<form
			action={async () => {
				'use server';
				await signOut();
			}}
		>
			<button {...props} />
		</form>
	);
}
