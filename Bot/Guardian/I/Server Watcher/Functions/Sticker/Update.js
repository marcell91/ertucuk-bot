const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');

const StickerUpdateTitles = {
  asset: 'Varlık',
  available: 'Kullanılabilir',
  description: 'Açıklama',
  format_type: 'Türü',
  guild_id: 'S.ID',
  id: 'ID',
  name: 'Isim',
  pack_id: 'Paket ID',
  sort_value: 'Sıralama',
  tags: 'Etiketler',
  type: 'Tür',
  user: 'Kullanıcı'
};

module.exports = async function stickerUpdate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'emoji');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Sticker Güncellendi!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ İşlem Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Eski Hali[0m',
            changes.map((change) => `[2;37m→ ${StickerUpdateTitles[change.key]}: [0m [2;31m${change.old}[0m`).join('\n'),
            '[2;30m# Yeni Hali[0m',
            changes.map((change) => `[2;37m→ ${StickerUpdateTitles[change.key]}: [0m [2;32m${change.new}[0m`).join('\n'),
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};