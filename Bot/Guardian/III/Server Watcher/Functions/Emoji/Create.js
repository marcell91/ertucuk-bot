const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function emojiCreate(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'emoji');
  if (safeMode?.isWarn) return;

  guild.emojis.cache.get(audit.targetId).delete({ reason: 'ertu ~ Güvenlik Sistemi' });
};