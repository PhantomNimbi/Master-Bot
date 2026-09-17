import type { GifTag } from '../types';

export const slapTag: GifTag = {
	name: 'slap',
	label: 'Slap',
	description: 'Slap someone or yourself across the face!',
	searchKeyword: 'slap',
	targetSupported: true,
	formatAction: (user, target) =>
		target && target.id !== user.id
			? `slaps ${target}! 🖐️`
			: 'slaps themselves... wait why? 🤔'
};
