const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AuditLogEvent, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { createRole, createChannel, createExpression } = require('../../../Utils/Functions');
const { RoleModel, ChannelModel } = require('../../../../../Global/Settings/Schemas')

module.exports = {
    name: 'denetim',
    aliases: ['audit'],

    execute: async (client, message, args) => {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('roleControl')
                    .setLabel('Rol Denetim')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('channelControl')
                    .setLabel('Kanal Denetim')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('emojiControl')
                    .setLabel('Emoji/Sticker Denetim')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('banControl')
                    .setLabel('Ban Denetim')
                    .setStyle(ButtonStyle.Secondary),
            )

        const question = await message.channel.send({
            components: [row]
        }).catch(err => { });

        const collector = question.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id, time: 60000
        });

        collector.on('collect', async i => {
            i.deferUpdate();
            if (i.customId === 'roleControl') {
                let arr = [];
                const roleAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
                roleAudit.forEach((x) => {
                    if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
                        arr.push({
                            label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
                            value: `role-${x.targetId}`,
                            description: `${x.targetId} ID'li Rol`
                        })
                    }
                })

                if (arr.length > 0) {
                    const newQuestion = await question.channel.send({
                        embeds: [
                            new EmbedBuilder({
                                footer: { text: `Son 24 Saat İçinde Silinmiş Roller`, iconURL: message.guild.iconURL({ dynamic: true }) },
                                description: `${roleAudit.map((x) => `\`${x.changes.filter(y => y.key == 'name').map(z => z.old)} (${x.target.id}) \` <t:${Math.floor(x.createdTimestamp / 1000)}>`).join('\n')}`
                            })
                        ],
                        components: [
                            new ActionRowBuilder({
                                components: [
                                    new ButtonBuilder({
                                        customId: 'roleCreate',
                                        label: 'Rol Kur',
                                        style: ButtonStyle.Secondary
                                    })
                                ]
                            })
                        ]
                    }).catch(err => { })

                    const roleCollector = newQuestion.createMessageComponentCollector({
                        filter: i => i.user.id === message.author.id, time: 60000
                    });

                    roleCollector.on('collect', async i => {
                        if (i.customId === 'roleCreate') {
                            const idInputRow = new ActionRowBuilder({
                                components: [
                                    new TextInputBuilder({
                                        custom_id: 'id',
                                        label: 'Rol ID',
                                        placeholder: '123456789123456789',
                                        style: TextInputStyle.Short,
                                        required: true
                                    })
                                ]
                            });

                            await i.showModal(
                                new ModalBuilder({
                                    custom_id: 'modal',
                                    title: 'Silinen Rolü Kur',
                                    components: [idInputRow]
                                })
                            );

                            const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 });
                            if (modalCollected) {
                                const roleId = modalCollected.fields.getTextInputValue('id')
                                const document = await RoleModel.findOne({ role: roleId });
                                if (!document) return await modalCollected.reply({ content: 'Rol veritabanında bulunamadı!', components: [], ephemeral: true }).catch(err => { });
                                await createRole(client, document);
                                await modalCollected.reply({ content: 'Rol başarıyla oluşturuldu!', components: [], ephemeral: true }).catch(err => { });
                            }
                        }
                    });
                } else {
                    question.edit({ content: `Silinmiş Rol Bulunamadı.`, embeds: [], components: [] }).catch(err => { });
                }
            } else if (i.customId === 'channelControl') {
                let arr = [];
                const channelAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
                channelAudit.forEach((x) => {
                    if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
                        arr.push({
                            label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
                            value: `channel-${x.targetId}`,
                            description: `${x.targetId} ID'li Kanal`
                        })
                    }
                })

                if (arr.length > 0) {
                    const newQuestion = await question.channel.send({
                        embeds: [
                            new EmbedBuilder({
                                footer: { text: `Son 24 Saat İçinde Silinmiş Kanallar`, iconURL: message.guild.iconURL({ dynamic: true }) },
                                description: `${channelAudit.map((x) => `\`${x.changes.filter(y => y.key == 'name').map(z => z.old)} (${x.target.id}) \` <t:${Math.floor(x.createdTimestamp / 1000)}>`).join('\n')}`
                            })
                        ],
                        components: [
                            new ActionRowBuilder({
                                components: [
                                    new ButtonBuilder({
                                        customId: 'channelCreate',
                                        label: 'Kanal Kur',
                                        style: ButtonStyle.Secondary
                                    })
                                ]
                            })
                        ]
                    }).catch(err => { });

                    const channelCollector = newQuestion.createMessageComponentCollector({
                        filter: i => i.user.id === message.author.id, time: 60000
                    });

                    channelCollector.on('collect', async i => {
                        if (i.customId === 'channelCreate') {
                            const idInputRow = new ActionRowBuilder({
                                components: [
                                    new TextInputBuilder({
                                        custom_id: 'id',
                                        label: 'Kanal ID',
                                        placeholder: '123456789123456789',
                                        style: TextInputStyle.Short,
                                        required: true
                                    })
                                ]
                            });

                            await i.showModal(
                                new ModalBuilder({
                                    custom_id: 'modal',
                                    title: 'Silinen Kanalı Kur',
                                    components: [idInputRow]
                                })
                            );

                            const modalCollected = await i.awaitModalSubmit({
                                filter: (i) => i.user.id === message.author.id,
                                time: 1000 * 60 * 5,
                            });

                            if (modalCollected) {
                                const channelId = modalCollected.fields.getTextInputValue('id')
                                const document = await ChannelModel.findOne({ channel: channelId });
                                if (!document) return await modalCollected.reply({ content: 'Kanal veritabanında bulunamadı!', components: [], ephemeral: true }).catch(err => { });
                                await modalCollected.reply({ content: 'Kanal başarıyla oluşturuldu!', components: [], ephemeral: true }).catch(err => { });
                                await createChannel(client, document);
                            
                            }

                        }
                    });

                } else {
                    question.reply({ content: `Silinmiş Kanal Bulunamadı.`, embeds: [], components: [] }).catch(err => { });
                }
            } else if (i.customId === 'emojiControl') {
                const arr = [];
                const emojiAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
                emojiAudit.forEach((x) => {
                    if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
                        arr.push({
                            label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
                            time: x.createdTimestamp,
                            value: `emoji-${x.targetId}`,
                            description: `${x.targetId} ID'li Emoji`,
                            type: 'emoji',
                        });
                    }
                });

                const stickerAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.StickerDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
                stickerAudit.forEach((x) => {
                    if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
                        arr.push({
                            label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
                            time: x.createdTimestamp,
                            value: `sticker-${x.targetId}`,
                            description: `${x.targetId} ID'li Sticker`,
                            type: 'emoji',
                        });
                    }
                });

                if (arr.length > 0) {
                    arr.sort((a, b) => b.time - a.time);
                    const newQuestion = await question.channel.send({
                        embeds: [
                            new EmbedBuilder({
                                footer: { text: `Son 24 Saat İçinde Silinmiş Emoji/Sticker`, iconURL: message.guild.iconURL({ dynamic: true }) },
                                description: `${arr.map((x) => `\`${x.label} (${x.description})\` <t:${Math.floor(x.time / 1000)}>`).join('\n')}`
                            })
                        ],
                        components: [
                            new ActionRowBuilder({
                                components: [
                                    new ButtonBuilder({
                                        customId: 'emojiCreate',
                                        label: 'Emoji Kur',
                                        style: ButtonStyle.Secondary
                                    }),

                                    new ButtonBuilder({
                                        customId: 'stickerCreate',
                                        label: 'Sticker Kur',
                                        style: ButtonStyle.Secondary
                                    })
                                ]
                            })
                        ]
                    }).catch(err => { });

                    const expressionCollector = newQuestion.createMessageComponentCollector({
                        filter: i => i.user.id === message.author.id, time: 60000
                    });

                    expressionCollector.on('collect', async i => {
                        if (i.customId === 'emojiCreate') {

                            const idInputRow = new ActionRowBuilder({
                                components: [
                                    new TextInputBuilder({
                                        custom_id: 'id',
                                        label: 'Emoji ID',
                                        placeholder: '123456789123456789',
                                        style: TextInputStyle.Short,
                                        required: true
                                    })
                                ]
                            });

                            await i.showModal(
                                new ModalBuilder({
                                    custom_id: 'modal',
                                    title: 'Silinen Emojiyi Kur',
                                    components: [idInputRow]
                                })
                            );

                            const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 });
                            if (modalCollected) {
                                const emojiId = modalCollected.fields.getTextInputValue('id')
                                await createExpression(client, emojiId, 'emoji');
                                await modalCollected.reply({ content: 'Emoji başarıyla oluşturuldu!', components: [], ephemeral: true }).catch(err => { });
                            }
                        } else if (i.customId === 'stickerCreate') {
                            const idInputRow = new ActionRowBuilder({
                                components: [
                                    new TextInputBuilder({
                                        custom_id: 'id',
                                        label: 'Sticker ID',
                                        placeholder: '123456789123456789',
                                        style: TextInputStyle.Short,
                                        required: true
                                    })
                                ]
                            });

                            await i.showModal(
                                new ModalBuilder({
                                    custom_id: 'modal',
                                    title: 'Silinen Stickerı Kur',
                                    components: [idInputRow]
                                })
                            );

                            const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 });
                            if (modalCollected) {
                                const stickerId = modalCollected.fields.getTextInputValue('id')
                                await createExpression(client, stickerId, 'sticker');
                                await i.editReply({ content: 'Sticker başarıyla oluşturuldu!', components: [] }).catch(err => { });
                            }
                        }
                    })
                } else {
                    question.edit({ content: `Son 24 saat içinde silinmiş **emoji/sticker** bulunamadı.`, embeds: [], components: [] }).catch(err => { });
                }
            } else if (i.customId === 'banControl') {
                const arr = [];
                const banAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
                banAudit.forEach((x) => {
                    arr.push({
                        label: `${x.target.username}`,
                        time: x.createdTimestamp,
                        value: `ban-${x.targetId}`,
                        description: `${x.targetId} ID'li Üye`,
                    });
                });

                if (arr.length > 0) {
                    arr.sort((a, b) => b.time - a.time);
                    question.edit({
                        embeds: [
                            new EmbedBuilder({
                                footer: { text: `Son 24 Saat İçinde Banlanmış Üyeler`, iconURL: message.guild.iconURL({ dynamic: true }) },
                                description: `${arr.map((x) => `\`${x.label} (${x.description})\` <t:${Math.floor(x.time / 1000)}>`).join('\n')}`
                            })
                        ],
                        components: []
                    }).catch(err => { });
                } else {
                    question.edit({ content: `Son 24 saat içinde banlanmış üye bulunamadı.`, embeds: [], components: [] }).catch(err => { });
                }
            }
        })
    }
}