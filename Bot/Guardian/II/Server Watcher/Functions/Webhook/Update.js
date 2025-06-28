const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function webhookUpdate(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'guildUpdate');
	if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Webhook Güncellendi!');
	else if (!safeMode) await punish(client, member, 3, 'Webhook Güncellendi!');
}