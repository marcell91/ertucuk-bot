const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function emojiDelete(client, guild, audit, member, changes) {
    const safeMode = await checkWhitelist(client, member, 'emoji');
    if (safeMode?.isWarn) return;

    const emoji = audit.target;
    if (emoji.animated) {
        guild.emojis.create({ name: changes.find(c => c.key === 'name').old, attachment: `https://cdn.discordapp.com/emojis/${emoji.id}.gif` });
    } else {
        guild.emojis.create({ name: changes.find(c => c.key === 'name').old, attachment: `https://cdn.discordapp.com/emojis/${emoji.id}.png` });
    }
};