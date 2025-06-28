const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');

module.exports = async function roleCreate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'role');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Bir Rol Oluşturuldu!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ Oluşturma Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Rol Bilgileri[0m',
            `[2;37m→ İsmi: ${audit.target.name}[0m`,
            `[2;37m→ ID: ${audit.target.id}[0m`,
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};