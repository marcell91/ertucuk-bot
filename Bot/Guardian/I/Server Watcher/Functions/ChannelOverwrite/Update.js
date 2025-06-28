const { EmbedBuilder, codeBlock, Role, PermissionsBitField } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const channelTypes = { 2: 'Ses Kanalı', 0: 'Yazı Kanalı', 5: 'Duyuru Kanalı', 4: 'Kategori', 13: 'Sahne', 15: 'Forum' };
const PermissionFlagsTitles = {
  CreateInstantInvite: 'Anlık Davet Oluştur',
  KickMembers: 'Üyeleri At',
  BanMembers: 'Üyeleri Yasakla',
  Administrator: 'Yönetici',
  ManageChannels: 'Kanalları Yönet',
  ManageGuild: 'Sunucuyu Yönet',
  AddReactions: 'Tepki Ekle',
  ViewAuditLog: 'Denetim Kayıtlarını Görüntüle',
  PrioritySpeaker: 'Öncelikli Konuşmacı',
  Stream: 'Canlı Yayın',
  ViewChannel: 'Kanalı Görüntüle',
  SendMessages: 'Mesaj Gönder',
  SendTTSMessages: 'TTS Mesajı Gönder',
  ManageMessages: 'Mesajları Yönet',
  EmbedLinks: 'Bağlantıları Göm',
  AttachFiles: 'Dosya Yükle',
  ReadMessageHistory: 'Mesaj Geçmişini Oku',
  MentionEveryone: 'Herkesi Belirt',
  UseExternalEmojis: 'Dış Emoji Kullan',
  ViewGuildInsights: 'Sunucu Bilgilerini Gör',
  Connect: 'Ses Kanalına Bağlan',
  Speak: 'Ses Kanalında Konuş',
  MuteMembers: 'Üyeleri Sessize Al',
  DeafenMembers: 'Üyeleri Sağırla',
  MoveMembers: 'Üyeleri Taşı',
  UseVAD: 'Ses Aktivitesi Algıla',
  ChangeNickname: 'Takma İsmi Değiştir',
  ManageNicknames: 'Takma İsimleri Yönet',
  ManageRoles: 'Rolleri Yönet',
  ManageWebhooks: 'Webhook\'ları Yönet',
  ManageEmojisAndStickers: 'Emoji ve Çıkartmaları Yönet',
  ManageGuildExpressions: 'Sunucu İfadelerini Yönet',
  UseApplicationCommands: 'Uygulama Komutlarını Kullan',
  RequestToSpeak: 'Sahne Kanalında Konuşma İsteği',
  ManageEvents: 'Etkinlikleri Yönet',
  ManageThreads: 'Konu Başlıklarını Yönet',
  CreatePublicThreads: 'Genel Konu Başlığı Oluştur',
  CreatePrivateThreads: 'Özel Konu Başlığı Oluştur',
  UseExternalStickers: 'Dış Çıkartma Kullan',
  SendMessagesInThreads: 'Konu Başlığında Mesaj Gönder',
  UseEmbeddedActivities: 'Gömülü Aktiviteleri Kullan',
  ModerateMembers: 'Üyeleri Sustur',
  ViewCreatorMonetizationAnalytics: 'Rol Abonelik Bilgilerini Gör',
  UseSoundboard: 'Ses Panosu Kullan',
  CreateGuildExpressions: 'Sunucu İfadeleri Oluştur',
  CreateEvents: 'Etkinlik Oluştur',
  UseExternalSounds: 'Dış Sesler Kullan',
  SendVoiceMessages: 'Sesli Mesaj Gönder',
  SendPolls: 'Anket Gönder'
};

module.exports = async function channelOverwriteUpdate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'channel');
  const isRole = audit.target instanceof Role;

  const allowChange = changes.find((c) => c.key === 'allow');
  const newAllowValue = allowChange?.new;

  const denyChange = changes.find((c) => c.key === 'deny');
  const newDenyValue = denyChange?.new;

  let allowedPermissions = [];
  let deniedPermissions = [];

  if (newAllowValue && newAllowValue !== '0') {
    try {
      const bigIntValue = BigInt(newAllowValue);
      allowedPermissions = new PermissionsBitField(bigIntValue).toArray();
    } catch (error) { }
  }

  if (newDenyValue && newDenyValue !== '0') {
    try {
      const bigIntValue = BigInt(newDenyValue);
      deniedPermissions = new PermissionsBitField(bigIntValue).toArray();
    } catch (error) { }
  }

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Kanal Yetkisi Güncellendi!',
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
              `[2;37m→ Ismi: ${audit.target.user.username}[0m`,
              `[2;37m→ ID: ${audit.target.id}[0m`,
              `[2;37m→ Hesap Oluşturulma Tarihi: ${date(audit.target.user.createdTimestamp)}[0m`,
              `[2;37m→ Sunucuya Katılma Tarihi: ${date(audit.target.joinedTimestamp)}[0m`,
            ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Açık Yetkileri[0m',
            allowedPermissions.map((key) => `[2;32m${PermissionFlagsTitles[key]}[0m`).list(),
            '[2;30m# Kapalı Yetkileri[0m',
            deniedPermissions.map((key) => `[2;31m${PermissionFlagsTitles[key]}[0m`).list(),
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};