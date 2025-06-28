const { PermissionsBitField: { Flags }, bold, inlineCode } = require('discord.js');

module.exports = {
    Name: 'stat',
    Aliases: ['verilerim', 'stats'],
    Description: 'Istatistiklerinizi gösterir.',
    Usage: 'stat',
    Category: 'Statistics',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            client.embed(message, `Kullanıcı bulunamadı!`);
            return;
        }

        if (member.user.bot) {
            client.embed(message, 'Botların verisi bulunamaz!');
            return;
        }

        const document = await member.stats(args[0] ? Number(args[0]) : undefined);
        if (!document) {
            client.embed(message, 'Veri bulunmuyor.');
            return;
        }

        const argIndex = member.id !== message.author.id ? 1 : 0;
        const wantedDay = args[argIndex] ? Number(args[argIndex]) : document.day;
        if (!wantedDay || 0 >= wantedDay) {
            client.embed(message, 'Geçerli gün sayısı belirt!');
            return;
        };

        embed.setDescription(`${member} adlı kullanıcının ${bold(`${wantedDay} günlük`)} veri bilgileri;`)
            .setFooter({ text: `${wantedDay > document.day ? `${document.day.toString()} günlük veri bulundu.` : 'ertu was here ❤️'}` })
            .addFields(
                {
                    name: `Toplam Ses Kanal Sıralaması (${client.functions.formatDurations(document.voice)})`,
                    value: (await Promise.all(document.channels.voice.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${await client.getEmoji('point')} ${channel}: ${inlineCode(client.functions.formatDurations(data.value))}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },

                {
                    name: `Toplam Yayın Kanal Sıralaması (${client.functions.formatDurations(document.stream)})`,
                    value: (await Promise.all(document.channels.stream.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${await client.getEmoji('point')} ${channel}: ${inlineCode(client.functions.formatDurations(data.value))}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },

                {
                    name: `Toplam Kamera Kanal Sıralaması (${client.functions.formatDurations(document.camera)})`,
                    value: (await Promise.all(document.channels.camera.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${await client.getEmoji('point')} ${channel}: ${inlineCode(client.functions.formatDurations(data.value))}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },

                {
                    name: `Toplam Mesaj Kanal Sıralaması (${document.message} Mesaj)`,
                    value: (await Promise.all(document.channels.message.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${await client.getEmoji('point')} ${channel}: ${inlineCode(data.value + ' mesaj')}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },

                {
                    name: `Diğer Bilgiler`,
                    value: [
                        `${await client.getEmoji('point')} Toplam Kayıt: ${bold(`${document.register} kayıt`)}`,
                        `${await client.getEmoji('point')} Toplam Davet: ${bold(`${document.invite} davet`)}`,
                        `${await client.getEmoji('point')} Toplam Tag Aldırma: ${bold(`${document.taggeds} kişi`)}`,
                        `${await client.getEmoji('point')} Toplam Yetki Aldırma: ${bold(`${document.staffs} kişi`)}`,
                    ].join('\n'),
                }
            );

        message.channel.send({
            embeds: [embed]
        });
    },
};