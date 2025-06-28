const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const channelTypes = { 2: 'Ses Kanalı', 0: 'Yazı Kanalı', 5: 'Duyuru Kanalı', 4: 'Kategori', 13: 'Sahne', 15: 'Forum' };

module.exports = async function channelCreate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'channel');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Kanal Oluşturuldu!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ İşlem Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Kanal Bilgileri[0m',
            `[2;37m→ Ismi: ${audit.target.name}[0m`,
            `[2;37m→ ID: ${audit.target.id}[0m`,
            `[2;37m→ Tipi: ${channelTypes[audit.target.type]}[0m`,
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};