const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function channelDelete(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'channel');
  if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Kanal Silindi!', 'close');
  else if (!safeMode) await punish(client, member, 3, 'Kanal Silindi!', 'close');
};
