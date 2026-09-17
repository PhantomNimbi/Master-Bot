import type { GifTag } from '../types';

export const patTag: GifTag = {
	name: 'pat',
	label: 'Pat',
	description: 'Give someone or yourself a gentle head pat!',
	searchKeyword: 'pat',
	targetSupported: true,
	formatAction: (user, target) =>
		target && target.id !== user.id
			? `pats ${target} on the head! 🥰`
			: 'gives themselves a gentle head pat! 😊'
};
