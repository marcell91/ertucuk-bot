const { Events } = require('discord.js');
const { Presence } = require('../../../Global/Helpers');
const LeaderBoard = require('../../../Global/Base/Jobs/Leaderboard');

module.exports = {
    Name: Events.ClientReady,
    System: true,

    execute: async (client) => {
        Presence(client);
        const channel = client.channels.cache.get(client.system.channelID);
        if (channel) await channel.join({ selfDeaf: true, selfMute: true, Interval: true });
        
        const guild = client.guilds.cache.get(client.system.serverID);
        if (!guild) return client.logger.error('Failed to fetch server data.', `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=bot+applications.commands`);
        
        await guild.updateRooms();
        await guild.watcher();
        await LeaderBoard(client, guild, guild?.find);

        const ertuBots = (global.ertuBots = {
            Main: [],
            Welcome: []
        })

        const Tokens = [
            client.system.Main.Mainframe,
            client.system.Main.Point,
            client.system.Main.Elixir,
            client.system.Security.Logger,
            client.system.Security.Backup,
            client.system.Security.Punish,
            ...client.system.Security.Dists
        ]

        const welcomeTokens = client.system.Welcome.Tokens

        Promise.all(
            Tokens.map(async (token) => {
                const data = await client.fetchClient(token)
                if (data) ertuBots.Main.push(data)
            })
        )

        Promise.all(
            welcomeTokens.map(async (token) => {
                const data = await client.fetchClient(token)
                if (data) ertuBots.Welcome.push(data)
            })
        )
    }
};