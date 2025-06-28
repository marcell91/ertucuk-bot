const { JoinModel } = require('../../../../../Global/Settings/Schemas');

module.exports = async function Staff(client, oldState, newState, ertu) {

    const member = oldState.guild.members.cache.get(oldState.id);

    if (oldState.channel && !newState.channel) {
        const data = await JoinModel.findOne({ id: oldState.id });
        if (!data) return;

        const time = Date.now() - data.voice;
        if (time <= 0) return;

        const category = oldState.guild.channels.cache.get(oldState.channelId)?.parent;
        if (!category) return;

        const afkChannels = oldState.channel.name.toLowerCase().includes('sleep') || oldState.channel.name.toLowerCase().includes('afk');

        const minutes = Math.max(Math.floor(time / (1000 * 60)), 1);
        if (afkChannels) return client.staff.checkRank(client, member, ertu, { type: 'afkPoints', amount: time, point: minutes * 2 });
        if (category.id === ertu.settings.publicParent) return client.staff.checkRank(client, member, ertu, { type: 'publicPoints', amount: time, point: minutes * 2 });
        if (category.id === ertu.settings.streamerParent) return client.staff.checkRank(client, member, ertu, { type: 'streamerPoints', amount: time, point: minutes * 2 });
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const data = await JoinModel.findOne({ id: oldState.id });
        if (!data) return;

        const time = Date.now() - data.voice;
        if (time <= 0) return;

        const category = oldState.guild.channels.cache.get(oldState.channelId)?.parent;
        if (!category) return;

        const afkChannels = oldState.channel.name.toLowerCase().includes('sleep') || oldState.channel.name.toLowerCase().includes('afk');

        const minutes = Math.max(Math.floor(time / (1000 * 60)), 1);
        if (afkChannels) return client.staff.checkRank(client, member, ertu, { type: 'afkPoints', amount: time, point: minutes * 2 });
        if (category.id === ertu.settings.publicParent && member.guild.afkChannelId !== oldState.channelId) return client.staff.checkRank(client, member, ertu, { type: 'publicPoints', amount: time, point: minutes * 2 });
        if (category.id === ertu.settings.streamerParent && member.guild.afkChannelId !== oldState.channelId) return client.staff.checkRank(client, member, ertu, { type: 'streamerPoints', amount: time, point: minutes * 2 });
    }
}