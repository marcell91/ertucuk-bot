const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function memberBan(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'memberUpdate');
  if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Üye Yasaklandı!');
  else if (!safeMode) await punish(client, member, 3, 'Üye Yasaklandı!');
};