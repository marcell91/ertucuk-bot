const { checkWhitelist, checkRoles } = require('../../../../Utils/Functions.js');

module.exports = async function memberRoleUpdate(client, guild, audit, member, changes) {
    const disallowedRoles = await checkRoles(guild, changes.map(c => ({ key: c.key.replace('$', ''), data: c.new })));
    if (disallowedRoles.add.length === 0 && disallowedRoles.remove.length === 0) return;

    const safeMode = await checkWhitelist(client, member, 'memberUpdate');
    if (safeMode?.isWarn) return;

    const user = guild.members.cache.get(audit.targetId)
    if (!user) return;
    user.roles.set([...user.roles.cache.filter(r => !disallowedRoles.add.find(dar => dar.id === r.id)).map(r => r.id), ...disallowedRoles.remove.map(rR => rR.id)]);
};
