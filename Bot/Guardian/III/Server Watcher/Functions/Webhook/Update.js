const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function webhookUpdate(client, guild, audit, member, changes) {
	const safeMode = await checkWhitelist(client, member, 'guildUpdate');
	if (safeMode?.isWarn) return;

	const detailedChanges = {};

	const webhook = audit.target;
	changes.forEach(change => {
		if (change.key === 'name') {
			detailedChanges['name'] = change.old;
		}

		if (change.key === 'channel_id') {
			detailedChanges['channel'] = change.old;
		}

		if (change.key === 'avatar_hash' && change.old) {
			detailedChanges['avatar'] = 'https://cdn.discordapp.com/avatars/' + audit.target.id + '/' + change.old;
		}

	});

	webhook.edit({ ...detailedChanges, reason: 'ertu ~ Güvenlik Sistemi' }).catch();
}