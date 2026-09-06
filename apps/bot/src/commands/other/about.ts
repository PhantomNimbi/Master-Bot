import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import {
	ChannelType,
	EmbedBuilder,
	GuildMember,
	type ChatInputCommandInteraction,
	type Guild
} from 'discord.js';

const REPO_URL = 'https://github.com/galnir/Master-Bot';
const SUPPORT_DISCORD = 'https://discord.gg/master-bot';

function formatUptime(milliseconds: number): string {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const parts: string[] = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	parts.push(`${seconds}s`);
	return parts.join(' ');
}

function formatDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

function countOnlineMembers(guild: Guild): number {
	let online = 0;
	for (const member of guild.members.cache.values()) {
		if (
			member.presence?.status === 'online' ||
			member.presence?.status === 'idle' ||
			member.presence?.status === 'dnd'
		) {
			online++;
		}
	}
	return online;
}

function guildRoleId(guild: Guild): string {
	return guild.roles.everyone.id;
}

@ApplyOptions<Command.Options>({
	name: 'about',
	description: 'Display detailed information about the bot, server, or a user',
	preconditions: ['isCommandDisabled']
})
export class AboutCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(subcommand =>
					subcommand
						.setName('bot')
						.setDescription('Display detailed information about Master-Bot')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('server')
						.setDescription('Display detailed information about this server')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('user')
						.setDescription('Display detailed information about a user')
						.addUserOption(option =>
							option
								.setName('user')
								.setDescription(
									'The user to get information about (defaults to you if omitted)'
								)
								.setRequired(false)
						)
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { client } = container;
		const subcommand = interaction.options.getSubcommand(false);

		if (subcommand === 'server') {
			if (!interaction.inGuild() || !interaction.guild) {
				return interaction.editReply({
					content:
						':information_source: The server subcommand can only be used inside a server.'
				});
			}

			const guild = interaction.guild;
			const owner = await guild.fetchOwner().catch(() => null);
			const textChannels = guild.channels.cache.filter(
				channel => channel.type === ChannelType.GuildText
			).size;
			const voiceChannels = guild.channels.cache.filter(
				channel => channel.type === ChannelType.GuildVoice
			).size;
			const categoryChannels = guild.channels.cache.filter(
				channel => channel.type === ChannelType.GuildCategory
			).size;

			const embed = new EmbedBuilder()
				.setTitle(guild.name)
				.setThumbnail(guild.iconURL({ size: 256 }) || null)
				.setColor('Blue')
				.setDescription('Here is some information about this server.')
				.addFields(
					{
						name: '👑 Owner',
						value: owner ? owner.user.tag : 'Unknown',
						inline: true
					},
					{
						name: '👥 Members',
						value: guild.memberCount.toLocaleString(),
						inline: true
					},
					{
						name: '🟢 Online',
						value: countOnlineMembers(guild).toLocaleString(),
						inline: true
					},
					{
						name: '📁 Channels',
						value: `${textChannels} text • ${voiceChannels} voice • ${categoryChannels} category`,
						inline: true
					},
					{
						name: '🎭 Roles',
						value: guild.roles.cache.size.toLocaleString(),
						inline: true
					},
					{
						name: '🚀 Boosts',
						value: `${guild.premiumSubscriptionCount} (Level ${guild.premiumTier})`,
						inline: true
					},
					{
						name: '🗓️ Created',
						value: formatDate(guild.createdAt),
						inline: true
					},
					{
						name: '🆔 ID',
						value: guild.id,
						inline: true
					},
					{
						name: '🌍 Locale',
						value: guild.preferredLocale || 'Unknown',
						inline: true
					}
				)
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL()
				})
				.setTimestamp();

			return interaction.editReply({ embeds: [embed] });
		} else if (subcommand === 'user') {
			const targetUser =
				interaction.options.getUser('user') || interaction.user;
			let member: GuildMember | null = null;
			if (interaction.inGuild() && interaction.guild) {
				member = await interaction.guild.members
					.fetch(targetUser.id)
					.catch(() => null);
			}

			const embed = new EmbedBuilder()
				.setTitle(targetUser.tag)
				.setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
				.setColor(member?.displayColor || 'Green')
				.setDescription(
					`Here is some information about **${targetUser.username}**.`
				)
				.addFields(
					{
						name: '🏷️ Display Name',
						value: member?.displayName || targetUser.username,
						inline: true
					},
					{
						name: '🆔 ID',
						value: targetUser.id,
						inline: true
					},
					{
						name: '🤖 Bot',
						value: targetUser.bot ? 'Yes' : 'No',
						inline: true
					},
					{
						name: '🗓️ Account Created',
						value: formatDate(targetUser.createdAt),
						inline: true
					}
				);

			if (member) {
				const roles = member.roles.cache
					.filter(role => role.id !== guildRoleId(member.guild))
					.sort((a, b) => b.position - a.position)
					.map(role => role.toString())
					.slice(0, 10);
				const topRole = member.roles.highest;
				embed.addFields(
					{
						name: '📅 Joined Server',
						value: member.joinedAt ? formatDate(member.joinedAt) : 'Unknown',
						inline: true
					},
					{
						name: '🏅 Top Role',
						value:
							topRole.id === guildRoleId(member.guild)
								? '*None*'
								: topRole.toString(),
						inline: true
					}
				);
				if (roles.length > 0) {
					embed.addFields({
						name: '🎭 Roles',
						value:
							roles.join(' ') +
							(member.roles.cache.size - 1 > 10
								? ` **+${member.roles.cache.size - 1 - 10} more**`
								: ''),
						inline: false
					});
				}
			}

			embed
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL()
				})
				.setTimestamp();

			return interaction.editReply({ embeds: [embed] });
		} else {
			const users = client.guilds.cache.reduce(
				(acc, guild) => acc + (guild.memberCount || 0),
				0
			);

			const embed = new EmbedBuilder()
				.setTitle(client.user?.username || 'Master-Bot')
				.setThumbnail(client.user?.displayAvatarURL() || null)
				.setDescription(
					'**Master-Bot** is a versatile Discord bot that brings a full music experience along with moderation, utilities, and fun commands to your server — all controlled through convenient slash commands.'
				)
				.setColor('Aqua')
				.addFields(
					{
						name: '🤖 Servers',
						value: client.guilds.cache.size.toLocaleString(),
						inline: true
					},
					{
						name: '👥 Total Users',
						value: users.toLocaleString(),
						inline: true
					},
					{
						name: '⏱️ Uptime',
						value: client.uptime ? formatUptime(client.uptime) : 'Unknown',
						inline: true
					},
					{
						name: '🏷️ Tag',
						value: client.user?.tag || 'Unknown',
						inline: true
					},
					{
						name: '🆔 ID',
						value: client.user?.id || 'Unknown',
						inline: true
					},
					{
						name: '✨ Activity',
						value:
							client.user?.presence?.activities
								?.map(activity => activity.name)
								.join(', ') || 'None',
						inline: true
					},
					{
						name: '🔗 Useful Links',
						value:
							`[Invite the bot](https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot&permissions=8) • ` +
							`[Commands](${REPO_URL}#available-commands) • ` +
							`[Support Server](${SUPPORT_DISCORD})`,
						inline: false
					}
				)
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL()
				})
				.setTimestamp();

			return interaction.editReply({ embeds: [embed] });
		}
	}
}

export const help: CommandHelp = {
	name: 'about',
	category: 'other',
	description: 'Display detailed information about the bot, server, or a user',
	usage: '/about <bot|server|user> [user: @User]',
	examples: [
		'/about bot',
		'/about server',
		'/about user',
		'/about user user: @User'
	],
	options: [
		{
			name: 'bot',
			description: 'Display detailed information about Master-Bot.',
			required: false
		},
		{
			name: 'server',
			description: 'Display detailed information about this server.',
			required: false
		},
		{
			name: 'user',
			description:
				'Display detailed user information (defaults to yourself if omitted).',
			required: false
		}
	]
};
