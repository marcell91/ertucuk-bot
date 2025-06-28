const { checkWhitelist, createRole } = require('../../../../Utils/Functions.js');
const { RoleModel } = require('../../../../../../Global/Settings/Schemas');

module.exports = async function roleDelete(client, guild, audit, member, changes, ertu) {
	const safeMode = await checkWhitelist(client, member, 'role');

	if (safeMode?.isWarn && !ertu.blackListedRoles.includes(audit?.targetId)) {
		await RoleModel.updateOne(
			{ id: guild.id, role: audit.targetId },
			{ $set: { isDeleted: true, deletedTimestamp: Date.now() } },
			{ upsert: true }
		);
		return;
	}

	const document = await RoleModel.findOne({ role: audit.targetId });
	if (!document) return;

	await createRole(client, document);
};