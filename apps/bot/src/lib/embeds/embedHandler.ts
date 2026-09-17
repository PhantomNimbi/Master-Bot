import {
	EmbedBuilder,
	type APIEmbedField,
	type ColorResolvable,
	type GuildMember,
	type User
} from 'discord.js';
import {
	EmbedColors,
	type BaseEmbedOptions,
	type CardEmbedOptions,
	type EmbedVariant
} from './types';

const LIMITS = {
	TITLE: 256,
	DESCRIPTION: 4096,
	FIELD_NAME: 256,
	FIELD_VALUE: 1024,
	FIELDS_COUNT: 25,
	FOOTER_TEXT: 2048,
	AUTHOR_NAME: 256
};

export function truncate(text: string, maxLength: number): string {
	if (!text) return '';
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Core Embed Layout Engine providing color systems, truncation safety,
 * and markdown helpers. Modular command/event handlers extend or build upon this.
 */
export class EmbedHandler {
	public static resolveColor(
		variant?: EmbedVariant,
		customColor?: ColorResolvable
	): ColorResolvable {
		if (customColor) return customColor;
		switch (variant) {
			case 'success':
				return EmbedColors.Success;
			case 'error':
				return EmbedColors.Error;
			case 'warning':
				return EmbedColors.Warning;
			case 'info':
				return EmbedColors.Info;
			case 'music':
				return EmbedColors.Music;
			case 'twitch':
				return EmbedColors.Twitch;
			case 'dark':
				return EmbedColors.Dark;
			case 'gold':
				return EmbedColors.Gold;
			case 'brand':
			default:
				return EmbedColors.Brand;
		}
	}

	public static create(options: BaseEmbedOptions = {}): EmbedBuilder {
		const embed = new EmbedBuilder();
		const color = this.resolveColor(options.variant, options.color);
		embed.setColor(color);

		if (options.title) {
			embed.setTitle(truncate(options.title, LIMITS.TITLE));
		}

		if (options.description) {
			embed.setDescription(truncate(options.description, LIMITS.DESCRIPTION));
		}

		if (options.url) {
			embed.setURL(options.url);
		}

		if (options.thumbnail) {
			embed.setThumbnail(options.thumbnail);
		}

		if (options.image) {
			embed.setImage(options.image);
		}

		if (options.author) {
			if ('username' in options.author || 'user' in options.author) {
				const user = 'user' in options.author ? options.author.user : options.author;
				embed.setAuthor({
					name: truncate(user.username ?? 'Unknown User', LIMITS.AUTHOR_NAME),
					iconURL: user.displayAvatarURL()
				});
			} else {
				embed.setAuthor({
					name: truncate(options.author.name, LIMITS.AUTHOR_NAME),
					iconURL: options.author.iconURL,
					url: options.author.url
				});
			}
		}

		if (options.footer) {
			if (typeof options.footer === 'string') {
				embed.setFooter({ text: truncate(options.footer, LIMITS.FOOTER_TEXT) });
			} else {
				embed.setFooter({
					text: truncate(options.footer.text, LIMITS.FOOTER_TEXT),
					iconURL: options.footer.iconURL
				});
			}
		} else if (options.user) {
			const u = 'user' in options.user ? options.user.user : options.user;
			embed.setFooter({
				text: truncate(`Requested by ${u.username}`, LIMITS.FOOTER_TEXT),
				iconURL: u.displayAvatarURL()
			});
		}

		if (options.timestamp === true || options.timestamp === undefined) {
			embed.setTimestamp();
		} else if (typeof options.timestamp === 'number' || options.timestamp instanceof Date) {
			embed.setTimestamp(options.timestamp);
		}

		if (options.fields && options.fields.length > 0) {
			const validFields = options.fields
				.filter((f): f is APIEmbedField => Boolean(f && f.name && f.value))
				.slice(0, LIMITS.FIELDS_COUNT)
				.map(f => ({
					name: truncate(f.name, LIMITS.FIELD_NAME),
					value: truncate(f.value, LIMITS.FIELD_VALUE),
					inline: f.inline ?? true
				}));

			if (validFields.length > 0) {
				embed.addFields(validFields);
			}
		}

		return embed;
	}

	public static success(options: BaseEmbedOptions): EmbedBuilder {
		const title = options.title?.startsWith('✅')
			? options.title
			: `✅ ${options.title || 'Success'}`;
		return this.create({
			...options,
			variant: 'success',
			title
		});
	}

	public static error(options: BaseEmbedOptions): EmbedBuilder {
		const title = options.title?.startsWith('❌')
			? options.title
			: `❌ ${options.title || 'Error'}`;
		return this.create({
			...options,
			variant: 'error',
			title
		});
	}

	public static warning(options: BaseEmbedOptions): EmbedBuilder {
		const title = options.title?.startsWith('⚠️')
			? options.title
			: `⚠️ ${options.title || 'Warning'}`;
		return this.create({
			...options,
			variant: 'warning',
			title
		});
	}

	public static info(options: BaseEmbedOptions): EmbedBuilder {
		const title = options.title?.startsWith('ℹ️')
			? options.title
			: `ℹ️ ${options.title || 'Information'}`;
		return this.create({
			...options,
			variant: 'info',
			title
		});
	}

	public static music(options: BaseEmbedOptions): EmbedBuilder {
		const title = options.title?.startsWith('🎵')
			? options.title
			: `🎵 ${options.title || 'Music'}`;
		return this.create({
			...options,
			variant: 'music',
			title
		});
	}

	public static card(options: CardEmbedOptions): EmbedBuilder {
		const prefix = options.badge ? `[${options.badge}] ` : '';
		const title = options.category
			? `${prefix}${options.category} • ${options.title || ''}`
			: `${prefix}${options.title || ''}`;

		return this.create({
			...options,
			title,
			variant: options.variant ?? 'dark'
		});
	}

	public static media(options: {
		description: string;
		image: string;
		title?: string;
		user?: User | GuildMember;
		color?: ColorResolvable;
	}): EmbedBuilder {
		return this.create({
			title: options.title,
			description: options.description,
			image: options.image,
			variant: 'brand',
			color: options.color,
			user: options.user,
			timestamp: false
		});
	}

	public static field(
		label: string,
		value: string | number | boolean | null | undefined,
		inline = true
	): APIEmbedField {
		const safeValue =
			value !== null && value !== undefined && value !== ''
				? String(value)
				: '*None*';

		return {
			name: truncate(label, LIMITS.FIELD_NAME),
			value: truncate(safeValue, LIMITS.FIELD_VALUE),
			inline
		};
	}

	public static fieldsFromRecord(
		record: Record<string, string | number | boolean | null | undefined>,
		inline = true
	): APIEmbedField[] {
		return Object.entries(record).map(([key, val]) =>
			this.field(key, val, inline)
		);
	}

	public static code(text: string): string {
		return `\`${text.replace(/`/g, "'")}\``;
	}

	public static codeBlock(code: string, lang = ''): string {
		return `\`\`\`${lang}\n${code}\n\`\`\``;
	}

	public static quote(text: string): string {
		return text
			.split('\n')
			.map(line => `> ${line}`)
			.join('\n');
	}

	public static list(items: string[], bullet = '•'): string {
		return items.map(item => `${bullet} ${item}`).join('\n');
	}

	public static timestamp(
		date: Date | number = new Date(),
		style: 'R' | 'F' | 'f' | 'D' | 'd' | 'T' | 't' = 'R'
	): string {
		const epoch = Math.floor(
			(typeof date === 'number' ? date : date.getTime()) / 1000
		);
		return `<t:${epoch}:${style}>`;
	}
}
