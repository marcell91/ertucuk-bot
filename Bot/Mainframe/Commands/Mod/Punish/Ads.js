const { PermissionsBitField: { Flags }, AttachmentBuilder } = require('discord.js');
const { PunitiveModel } = require('../../../../../Global/Settings/Schemas/')
const ms = require('ms');

module.exports = {
    Name: 'ads',
    Aliases: ['reklam'],
    Description: 'Reklam yapan kullanıcıyı cezalıya atarsınız.',
    Usage: 'reklam <@User/ID>',
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
            'Qurantine',
            ertu.settings.jailLimit ? Number(ertu.settings.jailLimit) : 5,
            ms('1h'),
        );

        if (limit.hasLimit) {
            client.embed(
                message,
                `Atabileceğiniz maksimum ceza limitine ulaştınız. Komutu ${limit.time} sonra tekrar deneyebilirsiniz.`,
            );
            return;
        };

        if (member) {
            if (client.functions.checkUser(message, member)) return;
            if (member.roles.cache.has(ertu.settings.adsRole)) {
                client.embed(message, 'Kullanıcıda zaten cezalı.');
                return;
            }
        };

        const question = await message.reply({
            embeds: [
                embed.setDescription(
                    'Kanıt için ekran görüntüsünü atınız. 2 dakika süreniz var, atılmazsa işlem iptal edilecek.',
                ),
            ],
        });

        const filter = (msg) => msg.author.id === message.author.id && msg.attachments.size > 0;
        const collected = await message.channel.awaitMessages({
            filter,
            time: 1000 * 60 * 60,
            max: 1,
        });

        if (collected) {
            const attachment = collected?.first()?.attachments.first()?.url;
            const control = await client.functions.controlImage(attachment);
            if (!control) return question.edit({
                embeds: [embed.setDescription('Geçersiz ekran görüntüsü.')],
                components: [client.functions.timesUp()],
            });

            const data = new AttachmentBuilder(attachment, { name: 'ertu.png' });
            if (!attachment) return question.edit({
                embeds: [embed.setDescription('Ekran görüntüsü reklam içermediği için işlem iptal edildi.')],
                components: [client.functions.timesUp()],
            });

            await PunitiveModel.updateMany(
                { user: member.id },
                { active: false },
            );

            member.punish({
                type: 'Ads',
                message: message,
                question: question,
                ertu: ertu,
                reason: 'Reklam',
                image: data,
            });
        }
    },
};