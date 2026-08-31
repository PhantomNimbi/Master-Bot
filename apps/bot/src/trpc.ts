import type { AppRouter } from '@master-bot/api/index';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
// @ts-ignore
import * as trpcServer from '@trpc/server';
// @ts-ignore
import * as PrismaClient from '@prisma/client';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

const baseUrl = (
	process.env.NEXTAUTH_URL_INTERNAL ||
	process.env.NEXTAUTH_URL ||
	'http://localhost:3000'
).replace(/\/+$/, '');

let activeBaseUrl = baseUrl;

const customFetch = async function (url: any, options: any) {
	const { default: nodeFetch } = await _importDynamic('node-fetch');

	const targetUrl =
		typeof url === 'string' && activeBaseUrl !== baseUrl
			? url.replace(baseUrl, activeBaseUrl)
			: url;

	try {
		const res = await nodeFetch(targetUrl, options);
		const contentType = res.headers.get('content-type') || '';
		if (res.ok && contentType.includes('application/json')) {
			return res;
		}
		// If 404 or HTML response on initial port, probe active dashboard ports
		if ((res.status === 404 || !contentType.includes('application/json')) && typeof url === 'string') {
			const fallbackPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
			for (const port of fallbackPorts) {
				const fallbackUrl = url
					.replace(/localhost:\d+/, `localhost:${port}`)
					.replace(/127\.0\.0\.1:\d+/, `127.0.0.1:${port}`);
				try {
					const altRes = await nodeFetch(fallbackUrl, options);
					const altContentType = altRes.headers.get('content-type') || '';
					if (altRes.ok && altContentType.includes('application/json')) {
						activeBaseUrl = `http://localhost:${port}`;
						return altRes;
					}
				} catch {}
			}
		}
		return res;
	} catch (err) {
		if (typeof url === 'string') {
			const fallbackPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
			for (const port of fallbackPorts) {
				const fallbackUrl = url
					.replace(/localhost:\d+/, `localhost:${port}`)
					.replace(/127\.0\.0\.1:\d+/, `127.0.0.1:${port}`);
				try {
					const altRes = await nodeFetch(fallbackUrl, options);
					if (altRes.ok) {
						activeBaseUrl = `http://localhost:${port}`;
						return altRes;
					}
				} catch {}
			}
		}
		throw err;
	}
};

const globalAny = global as any;
globalAny.fetch = customFetch;

export const trpcNode = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			transformer: superjson,
			url: `${baseUrl}/api/trpc`,
			fetch: customFetch as any
		})
	]
});
