const { GuildAuditLogsEntry, Guild } = require('discord.js');
const { ChannelModel } = require('../../../../../../Global/Settings/Schemas');
const { checkWhitelist, createChannel } = require('../../../../Utils/Functions.js');

module.exports = async function channelDelete(client, guild = Guild.prototype, audit = GuildAuditLogsEntry.prototype, member, changes, ertu) {
	const safeMode = await checkWhitelist(client, member, 'channel');
	if (safeMode?.isWarn && !ertu.blackListedChannels.includes(audit?.targetId)) {
		await ChannelModel.updateOne(
			{ id: guild.id, channel: audit.targetId },
			{ $set: { isDeleted: true, deletedTimestamp: Date.now() } },
			{ upsert: true }
		);
		return;
	}

	const document = await ChannelModel.findOne({ channel: audit.targetId });
	if (!document) return;

	await createChannel(client, document);
};