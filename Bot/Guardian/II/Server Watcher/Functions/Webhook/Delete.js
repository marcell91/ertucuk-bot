const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function webhookDelete(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'guildUpdate');
	if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Webhook Silindi!');
	else if (!safeMode) await punish(client, member, 3, 'Webhook Silindi!');
}