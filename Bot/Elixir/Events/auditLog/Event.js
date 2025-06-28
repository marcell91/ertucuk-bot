const { Events, AuditLogEvent } = require('discord.js');
const { logHandler, tagHandler, nameHandler } = require('./Functions');

module.exports = {
    Name: Events.GuildAuditLogEntryCreate,
    System: true,

    execute: async (client, log, guild) => {
        if (log.action !== AuditLogEvent.MemberUpdate) return;

        const ertu = guild?.find?.settings

        logHandler(client, log, guild);
        nameHandler(client, log, guild, ertu);
        if (guild.find.systems.public) tagHandler(client, log, guild, ertu);
    }
};          