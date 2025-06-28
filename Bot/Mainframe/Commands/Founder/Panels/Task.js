const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, bold, inlineCode } = require('discord.js');

module.exports = {
    Name: 'görevpanel',
    Aliases: ['görev-panel'],
    Description: 'Yetkili görev panelini ve görev türlerini gösterir.',
    Usage: 'görevpanel',
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
        const { ButtonBuilder, ButtonStyle } = require('discord.js');
        const systemEmbed = new EmbedBuilder()
            .setTitle('🟣 YETKİLİ GÖREV SİSTEMİ')
            .setDescription([
                `${bold('Sistemin İşleyişi')}`,
                '▫️ Kullanıcılar, çeşitli görevler alarak sunucuda aktif rol oynayacaklar.',
                '▫️ Her tamamlanan görev, kullanıcının yetki puanı kazanmasını sağlar.',
                '▫️ Yeterli yetki puanına ulaşıldığında, kullanıcılar bir sonraki yetki seviyesine yükselir.',
                '',
                `${bold('Görev Komutu:')}`,
                'Kullanıcılar mevcut görevlerini öğrenmek için `.görev` komutunu kullanabilirler. Her kullanıcının mevcut görev durumu ve yapması gerekenler bu komut ile görüntülenir.',
                '',
                `${bold('Yetki Durumu Komutu:')}`,
                'Kullanıcılar yetki durumu hakkında bilgi almak ve ne kadar puana ihtiyaçları olduğunu görmek için `.yetkim` komutunu kullanabilirler. Bu komut, mevcut yetki seviyesi ve bir sonraki yetkiye ulaşmak için gereken puanı gösterir.',
                '',
                '▫️ Görevler ile ilgili sorularınız için bizimle iletişime geçebilirsiniz.'
            ].join('\n'));

        // Panel yetkili rol kontrolü
        let allowedRoles = [];
        if (Array.isArray(ertu.settings?.taskPanelAuth)) allowedRoles = ertu.settings.taskPanelAuth;
        else if (ertu.settings?.taskPanelAuth) allowedRoles = [ertu.settings.taskPanelAuth];
        const hasPanelAuth = allowedRoles.some(roleId => message.member.roles.cache.has(roleId));
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('gorev-sec')
                .setLabel('Görev Seç')
                .setStyle(ButtonStyle.Primary)
        );

        // Eğer yetkili değilse buton aktif olsa bile uyarı mesajı gönder
        if (!allowedRoles.length || !hasPanelAuth) {
            await message.channel.send({ embeds: [systemEmbed], components: [buttonRow] });
            return;
        }

        await message.channel.send({ embeds: [systemEmbed], components: [buttonRow] });
    },
};