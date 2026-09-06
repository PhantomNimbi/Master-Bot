'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client';
import superjson from 'superjson';

import { api } from '~/utils/api';

const getBaseUrl = () => {
	if (typeof window !== 'undefined') return ''; // browser should use relative url

	const port = process.env.DASHBOARD_PORT ?? process.env.PORT ?? '3000';
	return (
		process.env.NEXTAUTH_URL_INTERNAL ??
		process.env.NEXTAUTH_URL ??
		`http://localhost:${port}`
	);
};

export function TRPCReactProvider(props: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 1000
					}
				}
			})
	);

	const [trpcClient] = useState(() =>
		api.createClient({
			links: [
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error)
				}),
				unstable_httpBatchStreamLink({
					transformer: superjson,
					url: `${getBaseUrl()}/api/trpc`,
					headers() {
						return { 'x-trpc-source': 'nextjs-react' };
					}
				})
			]
		})
	);

	return (
		<api.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{props.children}
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</api.Provider>
	);
}
