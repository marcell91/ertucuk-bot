const { Client, GatewayIntentBits, Partials, Events, AuditLogEvent, ChannelType } = require('discord.js');
const { channelCreate, channelDelete, channelUpdate, channelOverwriteCreate, channelOverwriteDelete, channelOverwriteUpdate, emojiCreate, emojiDelete, emojiUpdate, roleCreate, roleDelete, roleUpdate, stickerCreate, stickerDelete, stickerUpdate, webhookCreate, webhookDelete, webhookUpdate, memberBan, memberUnban, memberKick, memberRoleUpdate, memberUpdate, guildUpdate, botAdd } = require('./Server Watcher');
const { Security, serverID } = require('../../../Global/Settings/System');
const database = require('../Utils/Database');

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials),
    rest: { version: 10, hashLifetime: Infinity },
    presence: { status: 'invisible' },
    ws: { version: 10, properties: { $browser: 'discord.js' } }
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
client.login(Security.Punish).then(() => { console.log(`[BOT] ${client.user.tag} olarak giriş yaptı!`) }).catch((err) => { console.log(`[Logger] Başlatılamadı! Hata: ${err}`) });