const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function webhookCreate(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'guildUpdate');
	if (safeMode?.isWarn) return;

	const webhook = audit.target;
	if (webhook) webhook.delete().catch(() => null);
}