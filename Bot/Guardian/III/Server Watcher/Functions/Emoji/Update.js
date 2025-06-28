const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function emojiUpdate(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'emoji');
  if (safeMode?.isWarn) return;

  const emoji = audit.target;
  guild.emojis.cache.get(emoji.id).edit({ name: changes.find(c => c.key === 'name').old, reason: 'ertu ~ Güvenlik Sistemi' });
};