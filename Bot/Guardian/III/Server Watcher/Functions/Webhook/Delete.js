const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function webhookDelete(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'guildUpdate');
	if (safeMode?.isWarn) return;

	const webhook = audit.target;
	const channel = guild.channels.cache.get(webhook.channelId);

	if (channel) {
		channel.createWebhook({
			name: webhook.name,
		}).catch(() => null)
	}

}