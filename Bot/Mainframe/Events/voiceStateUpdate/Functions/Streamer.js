const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { SettingsModel } = require('../../../../../Global/Settings/Schemas');

module.exports = async function streamHandler(client, oldState, newState, ertu) {

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const data = ertu?.streamerRooms.find(x => x.channel === oldState.channelId);
        if (!data) return;

        if (data.owner !== oldState.id) return;

        const channel = newState.guild.channels.cache.get(data.channel);

        channel.permissionOverwrites.set(
            data.permissions.map((perm) => ({
                id: perm.id,
                allow: BigInt(perm.allow),
                deny: BigInt(perm.deny),
            })),
        );

        await SettingsModel.updateOne({ id: oldState.guild.id }, { $pull: { streamerRooms: { channel: oldState.channelId } } });
        return;
    }    

    if (oldState.channelId && !newState.channelId) {
        const data = ertu?.streamerRooms.find(x => x.channel === oldState.channelId);
        if (!data) return;

        if (data.owner !== oldState.id) return;

        const channel = newState.guild.channels.cache.get(data.channel);

        channel.permissionOverwrites.set(
            data.permissions.map((perm) => ({
                id: perm.id,
                allow: BigInt(perm.allow),
                deny: BigInt(perm.deny),
            })),
        );

        await SettingsModel.updateOne({ id: oldState.guild.id }, { $pull: { streamerRooms: { channel: oldState.channelId } } });
        return;
    }
}