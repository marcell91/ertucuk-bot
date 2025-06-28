const { PermissionsBitField: { Flags }, codeBlock, inlineCode, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment');
const { JoinModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'nerede',
    Aliases: ['n'],
    Description: 'Kullanıcının nerede olduğunu gösterir.',
    Usage: 'nerede <@User/ID>',
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

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) return client.embed(message, `Kullanıcı bulunamadı!`);
        if (!member.voice.channel) return client.embed(message, `Kullanıcı bir ses kanalında değil!`);

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'go',
                    label: 'Odasına Git',
                    style: ButtonStyle.Secondary
                }),

                new ButtonBuilder({
                    customId: 'pull',   
                    label: 'Odana Taşı',
                    style: ButtonStyle.Secondary
                })
            ]
        });

        const document = await JoinModel.findOne({ id: member.id });    
        const now = Date.now();

        const question = await message.channel.send({
            embeds: [
                embed.setDescription(`${member} adlı kullanıcı ${document ? inlineCode(client.functions.formatDurations(now - document?.voice) + 'dir') : '' } ${member.voice.channel} adlı ses kanalında!`)
                    .addFields(
                        {
                            name: '\u200B',
                            value: codeBlock('yaml', [
                                '# Kullanıcı Bilgileri',
                                `→ Mikrofon Durumu: ${(member.voice.mute ? member.voice.selfMute ? 'Kapalı!' : 'Kapalı! (Sunucu)' : 'Açık!')}`,
                                `→ Kulaklık Durumu: ${(member.voice.deaf ? member.voice.selfDeaf ? 'Kapalı!' : 'Kapalı! (Sunucu)' : 'Açık!')}`,
                                `→ Ekran Durumu: ${(member.voice.streaming ? 'Açık!' : 'Kapalı!')}`,
                                `→ Kamera Durumu: ${(member.voice.selfVideo ? 'Açık!' : 'Kapalı!')}`,
                                `→ Doluluk Durumu: ${(`${member.voice.channel.members.size}/${member.voice.channel.userLimit || '∞'}`)}`,
                            ].join('\n'))
                        },
                        {
                            name: '\u200B',
                            value: codeBlock('yaml', [
                                `# Kanalda Bulunanlar`,
                                member.voice.channel.members.map((m) => `→ ${m.displayName} [${m.user.displayName}]`).join('\n') || 'Üye yok!'
                            ].join('\n'))
                        }
                    )
            ],
            components: message.member.permissions.has(Flags.MoveMembers) || ertu.settings.moveAuth.some((role) => message.member?.roles.cache.has(role)) ? [row] : []
        });

        const filter = (i) => i.user.id === message.author.id;
        const collector = question.createMessageComponentCollector({ filter, time: 30000, max: 2 });

        collector.on('collect', async (i) => {

            if (i.customId === 'go') {
                if (!message.member.voice.channel) return i.reply({
                    content: 'Ses kanalında değilsin!',
                    components: [],
                    ephemeral: true
                });

                if (message.member.voice.channel === member.voice.channel) return i.reply({
                    content: 'Zaten aynı ses kanalındasınız!',
                    components: [],
                    ephemeral: true
                });

                await message.member.voice.setChannel(member.voice.channel);
                await i.reply({
                    content: 'Kullanıcının ses kanalına taşındın!',
                    components: [],
                    ephemeral: true
                });
            }

            if (i.customId === 'pull') {
                if (!message.member.voice.channel) return i.reply({
                    content: 'Ses kanalında değilsin!',
                    components: [],
                    ephemeral: true
                });

                if (message.member.voice.channel === member.voice.channel) return i.reply({
                    content: 'Zaten aynı ses kanalındasınız!',
                    components: [],
                    ephemeral: true
                });

                await member.voice.setChannel(message.member.voice.channel);
                await i.reply({
                    content: 'Kullanıcı ses kanalına taşındı!',
                    components: [],
                    ephemeral: true
                });
            }
        });
    },
};