const { UserModel } = require('../../../../../Global/Settings/Schemas');
const { AuditLogEvent } = require('discord.js');

module.exports = async function Boost(client, oldMember, newMember, ertu) {

    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        const entry = await newMember.guild
            .fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate })
            .then((audit) => audit.entries.first());

        if (entry && entry.target.id === newMember.id && entry.createdTimestamp > Date.now() - 5000) {
            const executor = oldMember.guild.members.cache.get(entry.executor.id);

            const authorizedRoles = ['#', '/'];
            const hasAuthorizedRole = executor?.roles?.cache.some(role =>
                authorizedRoles.includes(role.name.toLowerCase())
            );

            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

            addedRoles.forEach(role => {
                if (role.name.toLowerCase().includes('lideri')) {
                    if (!hasAuthorizedRole) {
                        if (executor.roles.cache.some(role => role.name === 'Yönetim Lideri')) return;
                        if (executor.roles.cache.some(role => role.name === 'Owner')) return;
                        
                        newMember.roles.remove(role.id).catch(() => { });
                    }
                }
            });

            addedRoles.forEach(role => {
                if (role.name.includes('𐋃𐋃')) {
                    if (!hasAuthorizedRole) {
                        newMember.roles.remove(role.id).catch(() => { });
                    }
                }
            });

            addedRoles.forEach(role => {
                if (role.name.includes('Gods')) {
                    if (!hasAuthorizedRole) {
                        newMember.roles.remove(role.id).catch(() => { });
                    }
                }
            });

            addedRoles.forEach(role => {
                if (role.id === ertu?.settings?.richRole) {
                    if (!hasAuthorizedRole) return newMember.roles.remove(role.id).catch(() => { }); 
                }
            });
        }
    }
}