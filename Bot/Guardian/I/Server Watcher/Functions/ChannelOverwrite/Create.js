const { EmbedBuilder, codeBlock, Role } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const channelTypes = { 2: 'Ses Kanalı', 0: 'Yazı Kanalı', 5: 'Duyuru Kanalı', 4: 'Kategori', 13: 'Sahne', 15: 'Forum' };

module.exports = async function channelOverwriteCreate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'channel');
  const isRole = audit.target instanceof Role;

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Kanal Yetkisi Oluşturuldu!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ İşlem Yapılan Kanal: ${audit.target.name} (${audit.target.id})`,
            `→ Kanal Tipi: ${channelTypes[audit.target.type]}`,
            `→ İşlem Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', isRole ?
            [
              '[2;30m# Rol Bilgileri[0m',
              `[2;37m→ Ismi: ${audit.target.name}[0m`,
              `[2;37m→ ID: ${audit.target.id}[0m`,
              `[2;37m→ Roldeki Üye Sayısı: ${audit.target.members.size}[0m`
            ].join('\n')
            :
            [
              '[2;30m# Üye Bilgileri[0m',
              `[2;37m→ Ismi: ${audit.target.username}[0m`,
              `[2;37m→ ID: ${audit.target.id}[0m`,
              `[2;37m→ Hesap Oluşturulma Tarihi: ${date(audit.target.createdTimestamp)}[0m`,
              `[2;37m→ Sunucuya Katılma Tarihi: ${date(audit.target.joinedTimestamp)}[0m`,
            ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};