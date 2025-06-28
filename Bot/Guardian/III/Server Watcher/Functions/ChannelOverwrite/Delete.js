const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function channelOverwriteDelete(client, guild, audit, member, changes, ertu) {
    const safeMode = await checkWhitelist(client, member, 'channel');
    if (safeMode?.isWarn) return;

    const channel = guild.channels.cache.get(audit.targetId);
    let newOverwrites = {};
    changes.forEach((change) => {
        if (change.key === 'allow') {
            newOverwrites[change?.old] = true;
        } else if (change.key === 'deny') {
            newOverwrites[change?.old] = false;
        }
    });
    channel?.permissionOverwrites?.create(`${changes.find((x) => x.key == 'id')?.old}`, newOverwrites).catch(err => { });
};