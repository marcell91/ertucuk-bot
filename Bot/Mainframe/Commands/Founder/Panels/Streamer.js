const { ActionRowBuilder, ButtonBuilder, ButtonStyle, roleMention, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'streamerbaşvuru',
    Aliases: ['streamer-başvuru'],
    Description: 'Streamer başvuru paneli',
    Usage: 'streamerbaşvuru',
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

        if (!ertu.settings.streamerRole) return message.channel.send({ content: `${await client.getEmoji('mark')} Streamer rolü ayarlanmamış.` });

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'streamer:appeal',
                    label: 'Başvuru Yap',
                    style: ButtonStyle.Secondary,
                    emoji: '1336476845650219049'
                })
            ]
        });

        message.delete().catch(() => { });
        message.channel.send({
            components: [row],
            embeds: [
                new EmbedBuilder({
                    title: 'Streamer Başvuru',
                    description: [
                        `Aşağıdaki adımları takip ederek başvurunuzu yapabilirsiniz. Bir sorun yaşamanız durumunda sunucu yetkililerine konu hakkında bilgi veriniz.\n\n` +
                        `1️⃣ İlk olarak [Speedtest](https://www.speedtest.net) sitesine gidip bir hız testi yapın..\n\n` +
                        `2️⃣ Hız testinizi tamamladıktan sonra **Başvuru Yap** butonuna tıklayın.\n\n` +
                        `3️⃣ Açılan forma hız testi linkinizi yapıştırın ve **Gönder** butonuna tıklayın.\n\n` +
                        `4️⃣ Başvurunuz alındıktan sonra gereken şartları sağlamanız durumunda otomatik olarak ${roleMention(ertu.settings.streamerRole)} rolü verilecektir.`
                    ].join('\n\n')
                })
            ]
        });
    },
};