const { ActionRowBuilder, ButtonBuilder, ButtonStyle, bold, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'streamerpanel',
    Aliases: ['streamer-panel'],
    Description: 'Streamer yönetim paneli',
    Usage: 'streamerpanel',
    Category: 'Founder',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {


        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'streamerRoom:claim',
                    label: 'Odayı Sahiplen',
                    style: ButtonStyle.Success
                }),
                new ButtonBuilder({
                    customId: 'streamerRoom:owner',
                    label: 'Oda Sahipliğini Aktar',
                    style: ButtonStyle.Primary
                }),
                new ButtonBuilder({
                    customId: 'streamerRoom:permission',
                    label: 'Odaya İzin Ekle/Çıkar',
                    style: ButtonStyle.Primary
                }),
                new ButtonBuilder({
                    customId: 'streamerRoom:settings',
                    label: 'Oda Ayarları',
                    style: ButtonStyle.Secondary
                }),
            ]
        });

        message.delete().catch(() => { });
        message.channel.send({
            components: [row],
            embeds: [
                new EmbedBuilder({
                    title: 'Yayıncı Odası Düzenleme Paneli',
                    description: [
                        `Merhaba, ${bold(`${message.guild?.name || 'ertu'}`)} yayıncı paneline hoşgeldiniz,`,
                        `Sunucumuzda bulunan ${bold('Yayıncı Odaları')} için düzenleme yapmak istiyorsanız, aşağıdaki seçeneklerden birini seçebilirsiniz.`,
                        `Yayıncı odaları, sunucumuzda oyun ve yayın açmayı seven kişilerin bir araya gelerek yayın yapabileceği özel odalardır.`,
                        `Bu odaların düzenlenmesi ve yönetilmesi, ${bold('yayın odası sahipleri')} tarafından gerçekleştirilmektedir.`,
                        `${await client.getEmoji('arrow')} ${bold('Oda Sahiplenme:')} Bulunduğunuz odayı sahiplenmek için bu seçeneği kullanabilirsiniz.`,
                        `${await client.getEmoji('arrow')} ${bold('Oda Sahipliğini Aktar:')} Yayıncı oda sahipliğini başka bir yetkiliye devretmek için bu seçeneği kullanabilirsiniz.`,
                        `${await client.getEmoji('arrow')} ${bold('Odaya İzin Ekle/Çıkar:')} Yayıncı oda sahiplerine izin eklemek veya çıkarmak için bu seçeneği kullanabilirsiniz.`,
                        `${await client.getEmoji('arrow')} ${bold('Oda Ayarları:')} Bulunduğunuz odayı düzenleyebilmek için bu seçeneği kullanabilirsiniz.`,
                    ].join('\n\n')
                })
            ]
        });
    },
};