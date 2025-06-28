const { Client, GatewayIntentBits, Partials, Events, AuditLogEvent, ChannelType, Collection } = require('discord.js');
const { channelCreate, channelDelete, channelUpdate, channelOverwriteCreate, channelOverwriteDelete, channelOverwriteUpdate, emojiCreate, emojiDelete, emojiUpdate, roleCreate, roleDelete, roleUpdate, stickerCreate, stickerDelete, stickerUpdate, webhookCreate, webhookDelete, webhookUpdate, memberBan, memberUnban, memberKick, memberRoleUpdate, memberUpdate, guildUpdate, botAdd } = require('./Server Watcher');
const { joinVoiceChannel } = require('@discordjs/voice');
const { readdir } = require('fs');
const { serverID, ownerID, channelID, Presence, Security } = require('../../../Global/Settings/System');
const { scheduleJob } = require('node-schedule');
const { expressionBackup, roleBackup, channelBackup } = require('../Utils/Functions');
const database = require('../Utils/Database');

const client = new Client({
	intents: Object.keys(GatewayIntentBits),
	partials: Object.keys(Partials),
	rest: { version: 10, hashLifetime: Infinity },
	presence: { status: Presence.Status, activities: [{ name: Presence.Message[Math.floor(Math.random() * Presence.Message.length)], type: Presence.Type }] },
	ws: { version: 10, properties: { $browser: 'discord.js' } }
});

const commands = client.commands = new Collection();
const aliases = client.aliases = new Collection();
readdir('./Commands/', (err, files) => {
	if (err) console.error(err)
	files.forEach(f => {
		readdir('./Commands/' + f, (err2, files2) => {
			if (err2) console.log(err2)
			files2.forEach(file => {
				let ertucum = require(`./Commands/${f}/` + file);
				commands.set(ertucum.name, ertucum);
				ertucum.aliases.forEach(alias => { aliases.set(alias, ertucum.name); });
			});
		});
	});

	console.log(`[COMMAND] Komutlar Yüklendi!`);
});

client.on(Events.ClientReady, async () => {
	const guild = client.guilds.cache.get(serverID);
	if (!guild) return;

	const channel = guild.channels.cache.get(channelID);
	if (!channel || channel.type !== ChannelType.GuildVoice) return;

	joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
		selfMute: true,
		selfDeaf: true,
	});

	console.log(`[AUTO BACKUP] Yeni Sunucu Yedeği Alınıyor!`)
	await roleBackup(guild);
	await channelBackup(guild);
	await expressionBackup(guild);
});

client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot || !message.guild) return;
	if (!ownerID.includes(message.author.id)) return;

	if (!message.content.startsWith(Security.Prefix)) return;
	const args = message.content.slice(1).trim().split(/ +/g);
	const commands = args.shift().toLowerCase();
	const cmd = client.commands.get(commands) || [...client.commands.values()].find((e) => e.aliases && e.aliases.includes(commands));
	if (cmd) {
		cmd.execute(client, message, args);
	}
});

client.on(Events.GuildAuditLogEntryCreate, async (audit, guild) => {
	const type = audit.action;
	const changes = audit.changes;
	const member = guild.members.cache.get(audit?.executorId);

	if (guild.id !== serverID) return;

	if (type === AuditLogEvent.ChannelCreate) await channelCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelDelete) await channelDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelUpdate) await channelUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelOverwriteCreate) await channelOverwriteCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelOverwriteDelete) await channelOverwriteDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelOverwriteUpdate) await channelOverwriteUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.EmojiCreate) await emojiCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.EmojiDelete) await emojiDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.EmojiUpdate) await emojiUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.RoleCreate) await roleCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.RoleDelete) await roleDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.RoleUpdate) await roleUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.StickerCreate) await stickerCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.StickerDelete) await stickerDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.StickerUpdate) await stickerUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.WebhookCreate) await webhookCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.WebhookDelete) await webhookDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.WebhookUpdate) await webhookUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberBanAdd) await memberBan(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberBanRemove) await memberUnban(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberKick) await memberKick(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberRoleUpdate) await memberRoleUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberUpdate) await memberUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.BotAdd) await botAdd(client, guild, audit, member, changes);
	if (type === AuditLogEvent.GuildUpdate) await guildUpdate(client, guild, audit, member, changes);
});

database.start(client)
client.login(Security.Logger).then(() => { console.log(`[BOT] ${client.user.tag} olarak giriş yaptı!`) }).catch((err) => { console.log(`[Logger] Başlatılamadı! Hata: ${err}`) })

scheduleJob('0 0 */2 * * *', async function () {
	const guild = client.guilds.cache.get(serverID);
	if (!guild) return;
	console.log(`[AUTO BACKUP] Yeni Sunucu Yedeği Alınıyor!`)
	await roleBackup(guild);
	await channelBackup(guild);
	await expressionBackup(guild);
})