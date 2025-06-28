const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function botAdd(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'full');
  if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Bot Eklendi!');
  else if (!safeMode) await punish(client, member, 3, 'Bot Eklendi!', 'close');
};