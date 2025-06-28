const { PermissionsBitField: { Flags } } = require('discord.js');
const ms = require('ms');

module.exports = {
    Name: 'scezalı',
    Aliases: ['scezali', 'stceza'],
    Description: 'Belirlenen üyeye streamer yasağı uygular.',
    Usage: 'scezalı <@User/ID>',
    Category: 'Moderation',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            client.embed(message, `Kullanıcı bulunamadı!`);
            return;
        }

        const limit = client.functions.checkLimit(
            message.author.id,
            'Stream',
            5,
            ms('1h'),
        );

        if (limit.hasLimit) {
            client.embed(
                message,
                `Atabileceğiniz maksimum susturma limitine ulaştınız. Komutu ${limit.time} sonra tekrar deneyebilirsiniz.`,
            );
            return;
        };

        if (member) {
            if (client.functions.checkUser(message, member)) return;
            if (member.roles.cache.has(ertu.settings.streamerPenaltyRole)) {
                client.embed(message, 'Kullanıcı zaten cezalı.');
                return;
            }
        };

        const time = args[1] ? args[1] : undefined;
        if (!time) {
            client.embed(message, `Lütfen bir süre belirtin!`);
            return;
        }

        const reason = args.splice(1).join(' ')
        if (!reason) {
            client.embed(message, `Lütfen bir sebep belirtin!`);
            return;
        }

        member.punish({
            type: 'Streamer',
            message: message,
            ertu: ertu,
            reason: reason,
        });
    },
};
