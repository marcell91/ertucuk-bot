const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const channelTypes = { 1: 'Webhook', 2: 'Kanal Duyuruları', 3: 'Uygulama' };
const WebhookUpdateTitles = {
  application_id: 'Uygulama ID',
  avatar: 'Avatar',
  channel_id: 'Kanal ID',
  guild_id: 'Sunucu ID',
  id: 'ID',
  name: 'Isim',
  source_channel: 'Kanal',
  source_guild: 'Sunucu',
  token: 'Token',
  type: 'Tür',
  url: 'Url',
  user: 'Kullanıcı'
};

module.exports = async function webhookUpdate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'webhook');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Webhook Güncellendi!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ İşlem Tarihi: ${date(Date.now())}`,
            `→ İşlem Kanalı: ${audit.target.channel.name} (${channelTypes[audit.target.channel.type]})`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Eski Hali[0m',
            changes.map((change) => `[2;37m→ ${WebhookUpdateTitles[change.key]}: [0m [2;31m${change.old}[0m`).join('\n'),
            '[2;30m# Yeni Hali[0m',
            changes.map((change) => `[2;37m→ ${WebhookUpdateTitles[change.key]}: [0m [2;32m${change.new}[0m`).join('\n'),
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })

};