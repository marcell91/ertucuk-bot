const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function channelCreate(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'channel');
  if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Kanal Oluşturuldu!');
  else if (!safeMode) await punish(client, member, 3, 'Kanal Oluşturuldu!');
};