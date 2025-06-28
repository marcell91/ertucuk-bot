const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function guildUpdate(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'guildUpdate');
  if (safeMode?.isWarn) return;

  const detailedChanges = {};
  changes.forEach(function (change) {
    switch (change.key) {
      case 'afk_channel_id':
        detailedChanges['afkChannel'] = change.old;
        break;
      case 'afk_timeout':
        detailedChanges['afkTimeout'] = change.old;
        break;
      case 'system_channel_id':
        detailedChanges['systemChannel'] = change.old;
        break;
      case 'default_message_notifications':
        detailedChanges['defaultMessageNotifications'] = change.old;
        break;
      case 'premium_progress_bar_enabled':
        detailedChanges['premiumProgressBarEnabled'] = change.old;
        break;
      case 'system_channel_flags':
        detailedChanges['systemChannelFlags'] = change.old;
        break;
      case 'banner_hash':
        detailedChanges['banner'] = 'https://cdn.discordapp.com/icons/' + guild.id + '/' + change.old;
        break;
      case 'icon_hash':
        detailedChanges['icon'] = 'https://cdn.discordapp.com/icons/' + guild.id + '/' + change.old;
        break;
      case 'verification_level':
        detailedChanges['verificationLevel'] = change.old;
        break;
      case 'name':
        detailedChanges['name'] = change.old;
        break;
    };
  });

  if (Object.values(detailedChanges).length > 0) guild.edit(detailedChanges);
};