const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function channelOverwriteCreate(client, guild, audit, member, changes) {
    const safeMode = await checkWhitelist(client, member, 'channel');
    if (safeMode?.isWarn) return;

    const targetChannel = guild.channels.cache.get(audit.targetId);
    if (targetChannel) targetChannel.permissionOverwrites.delete(`${changes.find((x) => x.key == 'id')?.new}`).catch(() => { });
};