const { EmbedBuilder, codeBlock } = require('discord.js');
const { checkWhitelist, date } = require('../../../../Utils/Functions.js');
const ChannelUpdateTitles = {
	default_auto_archive_duration: 'varsayılan otomatik arşiv süresi',
	default_thread_rate_limit_per_user: 'kullanıcı başı varsayılan konu hız sınırı',
	flags: 'bayraklar',
	guild_id: 'sunucu ID',
	id: 'ID',
	last_message_id: 'son mesaj ID',
	last_pin_timestamp: 'son pin zaman damgası',
	name: 'isim',
	nsfw: 'NSFW',
	parent_id: 'ebeveyn ID',
	permission_overwrites: 'izin değişiklikleri',
	position: 'pozisyon',
	rate_limit_per_user: 'kullanıcı başı hız sınırı',
	topic: 'konu',
	type: 'tip',
	bitrate: 'bit hızı',
	rtc_region: 'RTC bölgesi',
	user_limit: 'kullanıcı sınırı',
	video_quality_mode: 'video kalite modu',
	applied_tags: 'uygulanan etiketler',
	member: 'üye',
	member_count: 'üye sayısı',
	message_count: 'mesaj sayısı',
	owner_id: 'sahip ID',
	thread_metadata: 'konu metaverisi',
	total_message_sent: 'toplam gönderilen mesaj',
	available_tags: 'mevcut etiketler',
	default_reaction_emoji: 'varsayılan tepki emoji',
	default_sort_order: 'varsayılan sıralama düzeni'
};

module.exports = async function channelUpdate(client, guild, audit, member, changes) {
	const logChannel = guild.channels.cache.find((c) => c.name === 'guard-log') || client.users.cache.get(guild.ownerId);
	const safeMode = await checkWhitelist(client, member, 'channel');

	if (logChannel) logChannel.send({
		embeds: [
			new EmbedBuilder({
				title: 'Kanal Güncellendi!',
				description: [
					codeBlock('yaml', [
						`→ İşlem Yapan Kişi: ${member?.user.username} (${member?.id})`,
						`→ Güvenlik Durumu: ${safeMode ? '🟢 Güvenli Listede' : '🔴 Güvenli Değil'}`,
						`→ Kanal Bilgileri: ${audit.target.name} (${audit.target.id})`,
						`→ İşlem Tarihi: ${date(Date.now())}`,
						`→ Güvenlik Durumu: ${safeMode?.whitelistType || 'Güvenli Değil'}`,
						`→ Limit Durumu: ${safeMode?.limitType || 'Limit Aşıldı'} [${safeMode?.limitRatio || 'Cezalandırıldı'}]`,
					].join('\n')),
					codeBlock('ansi', [
						'[2;30m# Eski Hali[0m',
						changes.map((change) => `[2;37m→ ${ChannelUpdateTitles[change.key]}: [0m [2;31m${change.old}[0m`).join('\n'),
						'[2;30m# Yeni Hali[0m',
						changes.map((change) => `[2;37m→ ${ChannelUpdateTitles[change.key]}: [0m [2;32m${change.new}[0m`).join('\n'),
					].join('\n')),
				].join('\n'),
			})
		]
	})
};