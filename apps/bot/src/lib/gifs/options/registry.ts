import type { GifTag } from '../types';
import { amongusTag } from './amongusTag';
import { animeTag } from './animeTag';
import { bakaTag } from './bakaTag';
import { catTag } from './catTag';
import { doggoTag } from './doggoTag';
import { gintamaTag } from './gintamaTag';
import { hugTag } from './hugTag';
import { jojoTag } from './jojoTag';
import { patTag } from './patTag';
import { slapTag } from './slapTag';
import { waifuTag } from './waifuTag';

export const gifTags: Record<string, GifTag> = {
	amongus: amongusTag,
	anime: animeTag,
	baka: bakaTag,
	cat: catTag,
	doggo: doggoTag,
	gintama: gintamaTag,
	hug: hugTag,
	jojo: jojoTag,
	pat: patTag,
	slap: slapTag,
	waifu: waifuTag
};

export function getGifTag(name: string): GifTag | undefined {
	return gifTags[name.toLowerCase()];
}

export function getAllGifTags(): GifTag[] {
	return Object.values(gifTags);
}

export function getRandomGifTag(): GifTag {
	const all = getAllGifTags();
	const randomIndex = Math.floor(Math.random() * all.length);
	return all[randomIndex];
}

export function getGifChoices(): Array<{ name: string; value: string }> {
	return getAllGifTags().map(tag => ({
		name: `${tag.label} - ${tag.description}`,
		value: tag.name
	}));
}
