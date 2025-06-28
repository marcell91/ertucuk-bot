const { EmbedBuilder, codeBlock, UserFlags } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');

module.exports = async function botAdd(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'full');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Bot Eklendi!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ Eklenen Bot/Entegrasyon: ${audit.target.user.username} (${audit.target.user.id})`,
            `→ Ekleme Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Bot Bilgileri[0m',
            `[2;37m→ Ismi: ${audit.target.user.username}[0m`,
            `[2;37m→ ID: ${audit.target.user.id}[0m`,
            `[2;37m→ Onaylı Mı: ${audit.target.user.flags?.has(UserFlags.VerifiedBot) ? '🟢' : '🔴'}[0m`,
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};