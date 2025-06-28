const { PermissionsBitField: { Flags }, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    Name: 'çek',
    Aliases: ['pull'],
    Description: 'Belirttiğiniz kullanıcıyı odanıza çekersiniz.',
    Usage: 'çek <@User/ID>',
    Category: 'General',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {
        if (!message.member.voice.channel) return client.embed(message, `Bir ses kanalında olmalısınız!`);

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return client.embed(message, `Kullanıcı bulunamadı!`);
        if (member.id === message.author.id) return client.embed(message, `Kendinizi çekemezsiniz!`);
        if (!member.voice.channel) return client.embed(message, `Kullanıcı bir ses kanalında değil!`);
        if (member.voice.channel.id === message.member.voice.channel.id) return client.embed(message, `Kullanıcı zaten aynı kanalda!`);

        if (message.member.permissions.has(Flags.MoveMembers) || ertu.settings.moveAuth.some((role) => message.member?.roles.cache.has(role))) {
            member.voice.setChannel(message.member.voice.channel.id);
            return embed.setDescription(`Başarıyla ${member} adlı kullanıcı odanıza çekildi.`);
        } else {

            const row = new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        custom_id: 'accept',
                        label: 'Onayla',
                        style: ButtonStyle.Success,
                        emoji: { id: '1054856853814788216' },
                    }),
                    new ButtonBuilder({
                        custom_id: 'cancel',
                        label: 'Reddet',
                        style: ButtonStyle.Danger,
                        emoji: { id: '1057679211021746186' },
                    }),
                ],
            });

            const question = await message.reply({
                content: member.toString(),
                embeds: [
                    new EmbedBuilder({
                        description: `${message.member} seni ${message.member.voice.channel} kanalına çekmek istiyor. Kabul ediyor musun?`,
                        color: client.getColor('random'),
                    })
                ],
                components: [row],
            });

            const filter = (i) => i.user.id === member.id;
            const collector = question.createMessageComponentCollector({
                filter,
                time: 1000 * 60 * 5,
                componentType: ComponentType.Button,
            });

            collector.on('collect', async i => {
                if (i.customId === 'accept') {
                    member.voice.setChannel(message.member.voice.channel.id);
                    question.edit({
                        embeds: [
                            embed.setDescription(
                                `Başarıyla ${member} adlı kullanıcı odanıza çekildi.`,
                            ),
                        ],
                        components: [],
                    })
                } else {
                    question.edit({
                        embeds: [
                            embed.setDescription(
                                `${member} adlı kullanıcı odanıza çekme isteğinizi reddetti.`,
                            ),
                        ],
                        components: [],
                    })
                };
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    question.edit({ components: [client.functions.timesUp()] });
                }
            });
        }
    },
};