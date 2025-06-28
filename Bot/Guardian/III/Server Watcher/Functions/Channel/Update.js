const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function channelUpdate(client, guild, audit, member, changes, ertu) {
	const safeMode = await checkWhitelist(client, member, 'channel');
	if (safeMode?.isWarn) return;
	if (safeMode?.isWarn && !ertu.blackListedChannels.includes(audit?.targetId)) return;

	const targetChannel = guild.channels.cache.get(audit.targetId);

	if (targetChannel) guild.channels.edit(targetChannel.id, {
		name: changes.find((x) => x.key == 'name')?.old,
		position: changes.find((x) => x.key == 'position')?.old,
		topic: changes.find((x) => x.key == 'topic')?.old,
		nsfw: changes.find((x) => x.key == 'nsfw')?.old,
		parent: changes.find((x) => x.key == 'parent')?.old,
		userLimit: changes.find((x) => x.key == 'userLimit')?.old,
		bitrate: changes.find((x) => x.key == 'bitrate')?.old,
		reason: 'ertu ~ Güvenlik Sistemi'
	}).catch(() => { });
};
