import type { GifTag } from '../types';

export const hugTag: GifTag = {
	name: 'hug',
	label: 'Hug',
	description: 'Give someone or yourself a warm hug!',
	searchKeyword: 'hug',
	targetSupported: true,
	formatAction: (user, target) =>
		target && target.id !== user.id
			? `gives ${target} a big warm hug! 🤗`
			: 'gives themselves a warm hug! 🤗'
};
