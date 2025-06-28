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

module.exports = async function roleDelete(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'role');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Bir Rol Silindi!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ Silme Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Rol Bilgileri[0m',
            changes.map((c) => `[2;37m→ ${RoleUpdateTitles[c.key]}: ${c.old}[0m`).join('\n'),
          ].join('\n'))
        ].join('\n'),
      })
    ]
  })
};