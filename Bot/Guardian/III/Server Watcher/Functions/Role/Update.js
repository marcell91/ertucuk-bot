const { PermissionsBitField } = require('discord.js');
const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function roleUpdate(client, guild, audit, member, changes, ertu) {
	const safeMode = await checkWhitelist(client, member, 'role');
	if (safeMode?.isWarn) return;
	if (safeMode?.isWarn && !ertu.blackListedRoles.includes(audit?.targetId)) return;

	const role = audit.target;
	const detailedChanges = {};

	if (changes.find((x) => x.key === 'name')?.old) detailedChanges['name'] = changes.find((x) => x.key === 'name')?.old;
	if (changes.find((x) => x.key === 'color')?.old) detailedChanges['color'] = changes.find((x) => x.key === 'color')?.old;
	if (changes.find((x) => x.key === 'hoist')?.old) detailedChanges['hoist'] = changes.find((x) => x.key === 'hoist')?.old;
	if (changes.find((x) => x.key === 'mentionable')?.old) detailedChanges['mentionable'] = changes.find((x) => x.key === 'mentionable')?.old;
	if (changes.find((x) => x.key === 'permissions')?.old) detailedChanges['permissions'] = new PermissionsBitField(BigInt(changes.find((x) => x.key === 'permissions')?.old));

	if (Object.values(detailedChanges).length > 0) role.edit(detailedChanges);
};