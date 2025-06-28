const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function stickerCreate(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'emoji');
	if (safeMode?.isWarn) return;

	guild.stickers.cache.get(audit.target.id).delete({ reason: 'ertu ~ Güvenlik Sistemi' });
}