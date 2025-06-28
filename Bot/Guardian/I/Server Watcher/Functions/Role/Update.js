const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');

const RoleUpdateTitles = {
  color: 'Renk',
  flags: 'Bayraklar',
  hoist: 'En üstte',
  icon: 'Simge',
  id: 'Kimlik',
  managed: 'Yönetilen',
  mentionable: 'Bahsedilebilir',
  name: 'Isim',
  permissions: 'Izinler',
  position: 'Konum',
  tags: 'Etiketler',
  unicode_emoji: 'Emoji'
};

module.exports = async function roleUpdate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'role');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Bir Rol Güncellendi!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ Güncellenen Rol: ${audit.target.name} (${audit.target.id})`,
            `→ Güncelleme Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Eski Hali[0m',
            changes.map((change) => `[2;37m→ ${RoleUpdateTitles[change.key]}: [0m [2;31m${change.old}[0m`).join('\n'),
            '[2;30m# Yeni Hali[0m',
            changes.map((change) => `[2;37m→ ${RoleUpdateTitles[change.key]}: [0m [2;32m${change.new}[0m`).join('\n'),
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};