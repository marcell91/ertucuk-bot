const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function channelOverwriteUpdate(client, guild, audit, member, changes) {
    const safeMode = await checkWhitelist(client, member, 'channel');
    if (safeMode?.isWarn) return;

    const channel = audit.target;
    let oldWrites = {};

    changes.forEach(change => {
        if (change.key === 'allow') {
            oldWrites[change.old] = true;
        } else if (change.key === 'deny') {
            oldWrites[change.old] = false;
        }
    });

    channel?.permissionOverwrites?.edit(audit.extra, oldWrites)
};