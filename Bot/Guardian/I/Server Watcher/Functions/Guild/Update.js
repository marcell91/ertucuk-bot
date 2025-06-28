const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const GuildUpdateKeys = {
  afk_channel_id: 'AFK kanal ID',
  afk_timeout: 'AFK zaman aşımı',
  application_id: 'Uygulama ID',
  approximate_member_count: 'Yaklaşık üye sayısı',
  approximate_presence_count: 'Yaklaşık çevrimiçi',
  banner: 'Afiş',
  default_message_notifications: 'Varsayılan bildirimler',
  description: 'Açıklama',
  discovery_splash: 'Keşif splash',
  emojis: 'Emojiler',
  explicit_content_filter: 'İçerik filtresi',
  features: 'Özellikler',
  hub_type: 'Hub türü',
  icon: 'Simge',
  icon_hash: 'Simge hash',
  id: 'ID',
  max_members: 'Max üye',
  max_presences: 'Max çevrimiçi',
  max_stage_video_channel_users: 'Max sahne video',
  max_video_channel_users: 'Max video',
  mfa_level: 'MFA seviyesi',
  name: 'Sunucu adı',
  nsfw_level: 'NSFW seviyesi',
  owner: 'Sahip',
  owner_id: 'Sahip ID',
  permissions: 'İzinler',
  preferred_locale: 'Tercih edilen dil',
  premium_progress_bar_enabled: 'Premium çubuğu',
  premium_subscription_count: 'Premium abone',
  premium_tier: 'Premium kademe',
  public_updates_channel_id: 'Güncellemeler kanal ID',
  region: 'Bölge',
  roles: 'Roller',
  rules_channel_id: 'Kurallar kanal ID',
  safety_alerts_channel_id: 'Güvenlik uyarıları ID',
  splash: 'Splash',
  stickers: 'Çıkartmalar',
  system_channel_flags: 'Sistem bayrakları',
  system_channel_id: 'Sistem kanal ID',
  vanity_url_code: 'Özel URL kodu',
  verification_level: 'Doğrulama seviyesi',
  welcome_screen: 'Hoş geldiniz ekranı',
  widget_channel_id: 'Widget kanal ID',
  widget_enabled: 'Widget etkin'
};

module.exports = async function guildUpdate(client, guild, audit, member, changes) {
  const logChannel = guild.channels.cache.find(c => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
  const safeMode = await checkWhitelist(client, member, 'guildUpdate');

  if (logChannel) logChannel.send({
    embeds: [
      new EmbedBuilder({
        title: 'Sunucu Güncellendi!',
        description: [
          codeBlock('yaml', [
            `→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
            `→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
            `→ Güncelleme Tarihi: ${date(Date.now())}`,
            `→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
            `→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
          ].join('\n')),
          codeBlock('ansi', [
            '[2;30m# Eski Hali[0m',
            changes.map((change) => `[2;37m→ ${GuildUpdateKeys[change.key]}: [0m [2;31m${change.old}[0m`).join('\n'),
            '[2;30m# Yeni Hali[0m',
            changes.map((change) => `[2;37m→ ${GuildUpdateKeys[change.key]}: [0m [2;32m${change.new}[0m`).join('\n'),
          ].join('\n')),
        ].join('\n'),
      })
    ]
  })
};