import type { GifTag } from '../types';

export const bakaTag: GifTag = {
	name: 'baka',
	label: 'Baka',
	description: 'Call someone or yourself a baka!',
	searchKeyword: 'baka',
	targetSupported: true,
	formatAction: (user, target) =>
		target && target.id !== user.id
			? `thinks ${target} is a baka! 💢`
			: 'realized they are a baka! 🤦'
};
