const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');
const { PermissionsBitField } = require('discord.js');

module.exports = async function botAdd(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'full');
  if (safeMode?.isWarn) {
    const addedBot = guild.members.cache.get(audit.targetId);
    if (addedBot) {
      addedBot.roles.cache.forEach(async r => {
        if (r.permissions.has(PermissionsBitField.Flags.Administrator)) await r.setPermissions(PermissionsBitField.Flags.SendMessages);
      });
    }
    return;
  }

  guild.members.cache.get(audit.targetId).ban({ reason: 'ertu ~ Güvenlik Sistemi' }).catch(err => { });
};