const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function stickerUpdate(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'emoji');
	if (safeMode?.isWarn) return;

	guild.stickers.cache.get(audit.targetId).edit({
		name: changes.find((x) => x.key == 'name')?.old,
		description: changes.find((x) => x.key == 'description')?.old,
		tags: changes.find((x) => x.key == 'tags')?.old
	}).catch(err => { });
}