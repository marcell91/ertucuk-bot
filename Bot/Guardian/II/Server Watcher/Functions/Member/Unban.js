const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function memberUnban(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'memberUpdate');
  if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Üyenin Yasaklaması Kaldırıldı!');
  else if (!safeMode) await punish(client, member, 3, 'Üyenin Yasaklaması Kaldırıldı!');
};