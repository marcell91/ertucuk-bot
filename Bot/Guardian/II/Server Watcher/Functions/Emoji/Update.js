const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function emojiUpdate(client, guild, audit, member, changes) {
    const safeMode = await checkWhitelist(client, member, 'emoji');
    if (safeMode && !safeMode.isWarn) await punish(client, member, safeMode.punishType, 'Emoji Güncellendi!');
    else if (!safeMode) await punish(client, member, 3, 'Emoji Güncellendi!');
};