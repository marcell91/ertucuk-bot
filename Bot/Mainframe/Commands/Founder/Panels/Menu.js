const { bold, inlineCode, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js')

module.exports = {
    Name: 'menü',
    Aliases: ['menu', 'rolmenü', 'rolmenu'],
    Description: 'Rol seçme mesajını attırırsınız.',
    Usage: 'menü',
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

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rolepanel:event').setLabel('Etkinlik Katılımcısı').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rolepanel:giveaway').setLabel('Çekiliş Katılımcısı').setStyle(ButtonStyle.Success),
        );

        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rolepanel:color')
                .setPlaceholder('Renk rollerini seçmek için tıkla!')
                .addOptions([
                    { label: 'Gri', value: 'gri', emoji: { id: '1217564394309947495' } },
                    { label: 'Siyah', value: 'siyah', emoji: { id: '1217564387649388554' } },
                    { label: 'Beyaz', value: 'beyaz', emoji: { id: '1217564357810978897' } },
                    { label: 'Kırmızı', value: 'kırmızı', emoji: { id: '1217564350320083075' } },
                    { label: 'Mavi', value: 'mavi', emoji: { id: '1217564417672351775' } },
                    { label: 'Sarı', value: 'sarı', emoji: { id: '1217564355625746606' } },
                    { label: 'Yeşil', value: 'yeşil', emoji: { id: '1217564391344701532' } },
                    { label: 'Mor', value: 'mor', emoji: { id: '1217564359216337051' } },
                    { label: 'Turuncu', value: 'turuncu', emoji: { id: '1217564396176412823' } },
                    { label: 'Pembe', value: 'pembe', emoji: { id: '1217564354548072508' } },
                    { label: 'Kahverengi', value: 'kahverengi', emoji: { id: '1217564389432102942' } },
                    { label: 'Rol İstemiyorum', value: 'clear', emoji: { id: '1150046811327832095' } },
                ])
        )

        const row3 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rolepanel:ship')
                .setPlaceholder('İlişki rollerini seçmek için tıkla!')
                .addOptions([
                    { label: 'İlişkisi Var', value: 'couple', emoji: { id: '1150046674698383390' } },
                    { label: 'İlişkisi Yok', value: 'alone', emoji: { id: '1217557986524921857' } },
                    { label: 'Rol İstemiyorum', value: 'clear', emoji: { id: '1150046811327832095' } },
                ])
        )

        if (message) message.delete().catch(err => { });
        message.channel.send({
            content: [
                `### Merhaba ${bold(inlineCode(message.guild?.name || 'ertu'))} üyeleri.`,

                `Sunucuda sizleri rahatsız etmemek için @everyone veya @here atmayacağız. Sadece isteğiniz doğrultusunda aşağıda bulunan tepkilere tıklarsanız Çekilişler,Etkinlikler V/K ve D/C'den haberdar olacaksınız.`,

                `Eğer ${bold('Çekiliş Katılımcısı')} Buttonuna tıklarsanız sunucumuzda sıkça vereceğimiz nice ödüllerin bulunduğu çekilişlerden haberdar olabilirsiniz.`,

                `Eğer **Etkinlik Katılımcısı** Buttonuna tıklarsanız sunucumuzda düzenlenecek olan etkinlikler, konserler ve oyun etkinlikleri gibi etkinliklerden haberdar olabilirsiniz.`,

                `${bold('Aşağıda ki butonlara basarak siz de bu ödülleri kazanmaya hemen başlayabilirsiniz!')}`,
            ].join('\n\n'),
            components: [row, row2, row3],
            allowedMentions: { parse: [], repliedUser: true },
            flags: [4096]
        })
    },
};