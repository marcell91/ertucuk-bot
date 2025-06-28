const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');

const times = {
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  min: 60 * 1000
};

module.exports = async function memberUpdate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'memberUpdate');
  const logDetails = { old: [], new: [] };
  const detailedChanges = {};

  changes.forEach(change => detailedChanges[change.key] = { old: change.old, new: change.new });
  if (detailedChanges.nick) {
    logDetails.old.push(`${'→ Takma Adı:'} ${(detailedChanges.nick.old || 'Yok')}`);
    logDetails.new.push(`${'→ Takma Adı:'} ${(detailedChanges.nick.new || 'Yok')}`);
  };

  if (detailedChanges.communication_disabled_until) {
    const date = Date.now();
    const dates = {
      old: detailedChanges.communication_disabled_until.old ? new Date(detailedChanges.communication_disabled_until.old).getTime() - date : null,
      new: detailedChanges.communication_disabled_until.new ? new Date(detailedChanges.communication_disabled_until.new).getTime() - date : null
    };

    logDetails.old.push(`${'→ Zaman Aşımı:'} ${`${dates.old ? `${dates.old > times.day ? `${(dates.old / times.day).toFixed(0)} Gün` : dates.old > times.hour ? `${(dates.old / times.hour).toFixed(0)} Saat` : dates.old > times.min ? `${(dates.old / times.min).toFixed(0)} Dakika` : `${(dates.old / 1000).toFixed(0)} Saniye`}` : 'Yok'}`}`);
    logDetails.new.push(`${'→ Zaman Aşımı:'} ${`${dates.new ? `${dates.new > times.day ? `${(dates.new / times.day).toFixed(0)} Gün` : dates.new > times.hour ? `${(dates.new / times.hour).toFixed(0)} Saat` : dates.new > times.min ? `${(dates.new / times.min).toFixed(0)} Dakika` : `${(dates.new / 1000).toFixed(0)} Saniye`}` : 'Yok'}`}`);
  };

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Bir Üyenin Bilgileri Güncellendi!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${audit.executor.username} (${audit.executor.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ İşlem Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;37m→ Güncellenen Üye: [0m [2;31m' + member.user.username + ' (' + member.id + ')[0m',
            `[2;37m[+] Eski Bilgiler: [0m [2;31m${logDetails.old.join('\n') || 'Yok'}[0m`,
            `[2;37m[-] Yeni Bilgiler: [0m [2;31m${logDetails.new.join('\n') || 'Yok'}[0m`,
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};