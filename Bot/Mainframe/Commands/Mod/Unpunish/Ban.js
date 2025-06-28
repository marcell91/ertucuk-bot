const { PermissionsBitField: { Flags }, EmbedBuilder, inlineCode, bold } = require('discord.js');
const { PunitiveModel } = require('../../../../../Global/Settings/Schemas/')

module.exports = {
    Name: 'yargıkaldır',
    Aliases: ['yargı-kaldır', 'yargıkaldir', 'yargikaldir'],
    Description: 'Yasaklı kullanıcının banını kaldırırsın.',
    Usage: 'yargıkaldır <@User/ID>',
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

        const member = await client.getUser(args[0]);
        if (member.id === message.author.id) {
            client.embed(message, 'Kendi cezanızı kaldıramazsınız.');
            return;
        }

        const reason = args.slice(1).join(' ')
        if (!reason) {
            client.embed(message, 'Geçerli bir sebep belirtmelisiniz.')
            return;
        }

        const document = await PunitiveModel.findOne({ user: member.id, active: true, type: 'Ban' });
        if (!document) {
            client.embed(message, 'Kullanıcının cezası yok.');
            return;
        }

        message.guild.members.unban(member.id)
        message.channel.send({
            embeds: [
                embed.setDescription(`${member} (${member.id}) kullanıcısının başarıyla cezası kaldırıldı.`),
            ],
        });

        await PunitiveModel.updateMany(
            {
                active: true,
                user: member.id,
                type: 'Ban',
            },
            { $set: { active: false, remover: message.author.id, removedTime: Date.now(), removeReason: reason } },
        );
    },
};