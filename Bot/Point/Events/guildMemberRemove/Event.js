const { Events } = require('discord.js');
const { Staff, Stat } = require('./Functions');

module.exports = {
    Name: Events.GuildMemberRemove,
    System: true,

    execute: async (client, member) => {
        if (member.guild.id !== client.system.serverID || member.user.bot || !member.guild.find) return;

        try {
            Stat(client, member, member.guild.find);
            Staff(client, member, member.guild.find);
        } catch (error) {
            client.logger.error('@guildMemberRemove', error);
        }
    }
};