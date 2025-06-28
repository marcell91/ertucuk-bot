const { PermissionsBitField: { Flags }, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock, ComponentType, bold, inlineCode } = require('discord.js');
const { PunitiveModel } = require('../../../../../Global/Settings/Schemas/')

module.exports = {
    Name: 'unmute',
    Aliases: [],
    Description: 'Kullanıcının susturmasını kaldırır.',
    Usage: 'unmute <@User/ID>',
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

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            client.embed(message, 'Kullanıcı bulunamadı!')
            return;
        }

        const reason = args.slice(1).join(' ')
        if (!reason) {
            client.embed(message, 'Geçerli bir sebep belirtmelisiniz.')
            return;
        }

        const chatMute = await PunitiveModel.findOne({ user: member.id, active: true, type: 'ChatMute' });
        const voiceMute = await PunitiveModel.findOne({ user: member.id, active: true, type: 'VoiceMute' });

        if (!chatMute && !voiceMute) {
            client.embed(message, 'Kullanıcının cezası yok.');
            return;
        }

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    custom_id: 'chat_mute',
                    style: ButtonStyle.Secondary,
                    label: 'Metin Susturma',
                    disabled: chatMute ? false : true,
                }),

                new ButtonBuilder({
                    custom_id: 'voice_mute',
                    style: ButtonStyle.Secondary,
                    label: 'Ses Susturması',
                    disabled: voiceMute ? false : true,
                }),
            ],
        });

        const chatMuteStaff = chatMute ? await client.getUser(chatMute.staff) : null;
        const voiceMuteStaff = voiceMute ? await client.getUser(voiceMute.staff) : null;

        const question = await message.channel.send({
            content: member.toString(),
            embeds: [
                embed.setDescription(
                    [
                        `Kullanıcının ceza ${chatMute && voiceMute ? 'bilgileri' : 'bilgisi'} aşağıda listelenmektedir;`,
                        chatMute ?
                            codeBlock('yaml', [
                                '# Chat Mute Ceza Bilgisi',
                                `→ Ceza ID: ${chatMute.id}`,
                                `→ Yetkili: ${chatMuteStaff ? chatMuteStaff.username : 'Bilinmiyor'} (${chatMute.staff})`,
                                `→ Tarih: ${client.functions.date(chatMute.createdTime)}`,
                                `→ Bitiş Tarihi: ${chatMute.finishedTime !== undefined ? client.functions.date(chatMute.finishedTime) : 'Süresiz'}`,
                                `→ Sebep: ${chatMute.reason}`,
                            ].join('\n'))
                            : '',
                        voiceMute ?
                            codeBlock('yaml', [
                                '# Voice Mute Ceza Bilgisi',
                                `→ Ceza ID: ${voiceMute.id}`,
                                `→ Yetkili: ${voiceMuteStaff ? voiceMuteStaff.username : 'Bilinmiyor'} (${voiceMute.staff})`,
                                `→ Tarih: ${client.functions.date(voiceMute.createdTime)}`,
                                `→ Bitiş Tarihi: ${voiceMute.finishedTime !== undefined ? client.functions.date(voiceMute.finishedTime) : 'Süresiz'}`,
                                `→ Sebep: ${voiceMute.reason}`,
                            ].join('\n'))
                            : ''
                    ].join('\n')
                ),
            ],
            components: [row],
        });

        const filter = (i) => i.user.id === message.author.id;
        const collector = question.createMessageComponentCollector({
            filter,
            time: 1000 * 60,
            componentType: ComponentType.Button,
        });

        collector.on('collect', async (i) => {
            i.deferUpdate();
            if (i.customId === 'chat_mute') {
                member.roles.remove(ertu.settings.chatMuteRole);
                await PunitiveModel.updateMany(
                    { user: member.id, active: true, type: 'ChatMute' },
                    {
                        $set: {
                            active: false,
                            remover: message.author.id,
                            removedTime: Date.now(),
                            removeReason: reason,
                        },
                    },
                );

                question.edit({
                    embeds: [
                        embed.setDescription(`${member} kullanıcısının metin susturması başarıyla kaldırıldı.`),
                    ],
                    components: [],
                });
            } else if (i.customId === 'voice_mute') {
                member.roles.remove(ertu.settings.voiceMuteRole);
                if (member.voice.channel) member.voice.setMute(false);
                await PunitiveModel.updateMany(
                    { user: member.id, active: true, type: 'VoiceMute' },
                    {
                        $set: {
                            active: false,
                            remover: message.author.id,
                            removedTime: Date.now(),
                            removeReason: reason,
                        },
                    },
                );

                question.edit({
                    embeds: [
                        embed.setDescription(`${member} kullanıcısının ses susturması başarıyla kaldırıldı.`),
                    ],
                    components: [],
                });
            }
        });
    },
};