const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');

module.exports = async function emojiDelete(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'emoji');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Emoji Silindi!',
        image: { url: audit.target.imageURL() },
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ İşlem Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Emoji Bilgileri[0m',
            `[2;37m→ Ismi: ${audit.target.name}[0m`,
            `[2;37m→ ID: ${audit.target.id}[0m`,
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};