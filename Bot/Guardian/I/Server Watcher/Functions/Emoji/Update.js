const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const EmojiUpdateTitles = {
  animated: 'Animasyonlu',
  available: 'Kullanılabilir',
  id: 'ID',
  managed: 'Yönetilen',
  name: 'İsim',
  require_colons: 'İhtiyaç olanlar',
  roles: 'Roller',
  user: 'Kullanıcı'
};

module.exports = async function emojiUpdate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'emoji');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Emoji Güncellendi!',
        image: { url: audit.target.imageURL() },
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ Emoji Bilgileri: ${target.name} (${target.id})`,
            `→ İşlem Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Eski Hali[0m',
            changes.map((change) => `[2;37m→ ${EmojiUpdateTitles[change.key]}: [0m [2;31m${change.old}[0m`).join('\n'),
            '[2;30m# Yeni Hali[0m',
            changes.map((change) => `[2;37m→ ${EmojiUpdateTitles[change.key]}: [0m [2;32m${change.new}[0m`).join('\n'),
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};