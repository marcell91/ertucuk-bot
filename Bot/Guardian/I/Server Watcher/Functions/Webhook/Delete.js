const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const channelTypes = { 1: 'Webhook', 2: 'Kanal Duyuruları', 3: 'Uygulama' };

module.exports = async function webhookDelete(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'webhook');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Webhook Silindi!',
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
            '[2;30m# Webhook Bilgileri[0m',
            `[2;37m→ İsmi: [0m [2;31m${audit.target.name}[0m`,
            `[2;37m→ ID: [0m [2;31m${audit.target?.id}[0m`,
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })

};