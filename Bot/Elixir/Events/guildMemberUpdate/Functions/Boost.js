const { UserModel } = require('../../../../../Global/Settings/Schemas');

module.exports = async function Boost(client, oldMember, newMember, ertu) {

    if (
        !(oldMember.premiumSince && !newMember.premiumSince) ||
        newMember.roles.cache.has(ertu.settings.vipRole) ||
        [
            ertu.settings.underworldRole,
            ertu.settings.quarantineRole,
            ...ertu.settings.unregisterRoles
        ].some(r => newMember.roles.cache.has(r))
    ) return;

    if (ertu.systems.taggedMode) {
        if (newMember.voice.channel) newMember.voice.disconnect().catch(() => { });
        if (newMember.manageable) await newMember.setRoles(ertu.settings.unregisterRoles);
    } else {
        const document = await UserModel.findOne({ id: newMember.id });
        if (document && document.name && document.nameLogs) {
            await newMember.setNickname(`${newMember.tag()} ${document.name}`);
        }
    }
}