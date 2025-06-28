const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function stickerCreate(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'emoji');
	if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Sticker Oluşturuldu!');
	else if (!safeMode) await punish(client, member, 3, 'Sticker Oluşturuldu!');
}