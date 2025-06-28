const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function roleDelete(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'role');
	if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Rol Silindi!', 'close');
	else if (!safeMode) await punish(client, member, 3, 'Rol Silindi!', 'close');
}