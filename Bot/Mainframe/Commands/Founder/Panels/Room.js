const { PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle, bold, inlineCode } = require('discord.js');

module.exports = {
    Name: 'secretroom',
    Aliases: ['secretrooms', 'gizlioda', 'privateroom'],
    Description: 'Sunucunuzda gizli oda oluşturur.',
    Usage: 'secretroom',
    Category: 'Founder',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {

        message.delete().catch(() => { });
        message.channel.send({
            embeds: [
                embed.setDescription([
                    `Merhaba ${bold(message.guild?.name || '')} özel oda paneline hoşgeldiniz.`,
                    '',
                    `${inlineCode(' Odanın İsmini Değiştir   : ')} ${await client.getEmoji('change')}`,
                    `${inlineCode(' Odanın Limitini Değiştir : ')} ${await client.getEmoji('limit')}`,
                    `${inlineCode(' Odayı Kilitle/Kilidi Aç  : ')} ${await client.getEmoji('lock')}`,
                    `${inlineCode(' Odayı Gizle/Gizliyi Aç   : ')} ${await client.getEmoji('visible')}`,
                    `${inlineCode(' Odaya Kişi Ekle/Çıkar    : ')} ${await client.getEmoji('member')}`
                ].join('\n')),
            ],

            components: [
                new ActionRowBuilder({
                    components: [
                        new ButtonBuilder({
                            custom_id: 'secretroom:change',
                            style: ButtonStyle.Secondary,
                            emoji: { id: await client.getEmojiID('change') },
                        }),
                        new ButtonBuilder({
                            custom_id: 'secretroom:limit',
                            style: ButtonStyle.Secondary,
                            emoji: { id: await client.getEmojiID('limit') },
                        }),
                        new ButtonBuilder({
                            custom_id: 'secretroom:lock',
                            style: ButtonStyle.Secondary,
                            emoji: { id: await client.getEmojiID('lock') },
                        }),
                        new ButtonBuilder({
                            custom_id: 'secretroom:visible',
                            style: ButtonStyle.Secondary,
                            emoji: { id: await client.getEmojiID('visible') },
                        }),
                        new ButtonBuilder({
                            custom_id: 'secretroom:member',
                            style: ButtonStyle.Secondary,
                            emoji: { id: await client.getEmojiID('member') },
                        }),
                    ]
                })
            ]
        });
    },
};