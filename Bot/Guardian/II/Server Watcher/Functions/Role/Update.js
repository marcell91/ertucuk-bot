const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function roleUpdate(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'role');
	if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Rol Güncellendi!');
	else if (!safeMode) await punish(client, member, 3, 'Rol Güncellendi!');
}