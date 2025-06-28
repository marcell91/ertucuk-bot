const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function stickerDelete(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'emoji');
	if (safeMode?.isWarn) return;

	guild.stickers.create({
		name: audit.target.name,
		description: audit.target?.description,
		tags: audit.target.tags,
		file: { attachment: audit.target?.url }
	}).catch(err => { });
}