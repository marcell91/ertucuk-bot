const { checkWhitelist, punish, checkRoles } = require('../../../../Utils/Functions.js');

module.exports = async function memberRoleUpdate(client, guild, audit, member, changes) {
  const disallowedRoles = await checkRoles(guild, changes.map(c => ({ key: c.key.replace('$', ''), data: c.new })));
  if (disallowedRoles.add.length === 0 && disallowedRoles.remove.length === 0) return;

  const safeMode = await checkWhitelist(client, member, 'memberUpdate');
  if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Üyenin Rolleri Güncellendi!', 'close');
  else if (!safeMode) await punish(client, member, 3, 'Üyenin Rolleri Güncellendi!', 'close');
};