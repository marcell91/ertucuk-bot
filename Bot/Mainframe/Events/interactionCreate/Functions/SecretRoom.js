
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, StringSelectMenuBuilder, UserSelectMenuBuilder } = require('discord.js');
const { SettingsModel } = require('../../../../../Global/Settings/Schemas')
const inviteRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/([a-zA-Z0-9\-]{2,32})\b/;
const adsRegex = /([^a-zA-ZIıİiÜüĞğŞşÖöÇç\s])+/gi;

module.exports = async function SecretRoom(client, interaction, route) {
    const ertu = await SettingsModel.findOne({ id: interaction.guild.id })
    const hasOwneredChannel = (ertu.privateRooms || []).find(x => x.owner === interaction.user.id);

    if (route === 'change' && hasOwneredChannel) {
        const voiceChannel = interaction.guild?.channels.cache.get(hasOwneredChannel.channel);

        if (voiceChannel.parentId !== ertu.settings?.customRoomParent) {
            return interaction.reply({
                content: 'Bu komutu sadece özel oda kategorisinde kullanabilirsiniz.',
                ephemeral: true
            });
        };

        if (interaction.user.id !== hasOwneredChannel.owner) {
            return interaction.reply({
                content: 'Bu komutu sadece kendi odanızda kullanabilirsiniz.',
                ephemeral: true
            });
        }

        if (voiceChannel) {
            const modal = new ModalBuilder({
                custom_id: 'modal',
                title: 'Oda İsmini Düzenle',
                components: [
                    new ActionRowBuilder({
                        components: [
                            new TextInputBuilder({
                                custom_id: 'name',
                                label: 'Özel Oda İsmi',
                                min_length: 3,
                                max_length: 15,
                                style: TextInputStyle.Short,
                                required: true,
                            })
                        ]
                    }),
                ]
            });

            await interaction.showModal(modal);

            const modalCollected = await interaction.awaitModalSubmit({ time: 1000 * 60 * 2 });
            const channelName = modalCollected.fields.getTextInputValue('name');

            if (modalCollected) {
                if (channelName.match(inviteRegex)) return modalCollected.reply({ content: 'Özel oda isminde link kullanamazsınız.', ephemeral: true });
                if (channelName.match(adsRegex)) return modalCollected.reply({ content: 'Özel oda isminde reklam yapamazsınız.', ephemeral: true });

                await voiceChannel.setName(channelName).catch((err) => console.error())

                modalCollected.reply({
                    content: `Özel oda düzenlendi: ${voiceChannel}`,
                    ephemeral: true
                });
            };
        };
    } else if (route === 'change' && !hasOwneredChannel) {
        return interaction.reply({
            content: 'Özel oda bulunamadı.',
            ephemeral: true
        });
    }

    if (route === 'limit' && hasOwneredChannel) {
        const voiceChannel = interaction.guild?.channels.cache.get(hasOwneredChannel.channel);

        if (voiceChannel.parentId !== ertu.settings?.customRoomParent) {
            return interaction.reply({
                content: 'Bu komutu sadece özel oda kategorisinde kullanabilirsiniz.',
                ephemeral: true
            });
        };

        if (interaction.user.id !== hasOwneredChannel.owner) {
            return interaction.reply({
                content: 'Bu komutu sadece kendi odanızda kullanabilirsiniz.',
                ephemeral: true
            });
        }

        if (voiceChannel) {
            const modal = new ModalBuilder({
                custom_id: 'modal2',
                title: 'Oda Limitini Düzenle',
                components: [
                    new ActionRowBuilder({
                        components: [
                            new TextInputBuilder({
                                custom_id: 'limit',
                                label: 'Oda Limiti',
                                min_length: 1,
                                max_length: 2,
                                style: TextInputStyle.Short,
                                required: true,
                                value: voiceChannel.userLimit
                            })
                        ]
                    }),
                ]
            });

            await interaction.showModal(modal);

            const modalCollected = await interaction.awaitModalSubmit({ time: 1000 * 60 * 2 });
            const userLimit = modalCollected.fields.getTextInputValue('limit');
            if (isNaN(userLimit)) return modalCollected.reply({ content: 'Limit sadece sayı olabilir.', ephemeral: true });

            if (modalCollected) {
                await voiceChannel.setUserLimit(parseInt(userLimit));

                modalCollected.reply({
                    content: `Özel oda limiti düzenlendi: ${voiceChannel}`,
                    ephemeral: true
                });
            };
        };
    } else if (route === 'limit' && !hasOwneredChannel) {
        return interaction.reply({
            content: 'Özel oda bulunamadı.',
            ephemeral: true
        });
    }

    if (route === 'lock' && hasOwneredChannel) {
        const voiceChannel = interaction.guild?.channels.cache.get(hasOwneredChannel.channel);

        if (voiceChannel.parentId !== ertu.settings?.customRoomParent) {
            return interaction.reply({
                content: 'Bu komutu sadece özel oda kategorisinde kullanabilirsiniz.',
                ephemeral: true
            });
        };

        if (interaction.user.id !== hasOwneredChannel.owner) {
            return interaction.reply({
                content: 'Bu komutu sadece kendi odanızda kullanabilirsiniz.',
                ephemeral: true
            });
        }

        if (voiceChannel) {
            const permissions = voiceChannel.permissionOverwrites?.cache.find(
                perm => perm.id === interaction.guild.id
            );

            if (!permissions) {
                return interaction.reply({
                    content: 'Bu kanal için geçerli izinler bulunamadı.',
                    ephemeral: true
                });
            }

            if (permissions.deny.has(PermissionFlagsBits.Connect)) {
                await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                    [PermissionFlagsBits.Connect]: null
                });
                interaction.reply({
                    content: 'Kanal herkese açıldı.',
                    ephemeral: true
                });
            } else {
                await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                    [PermissionFlagsBits.Connect]: false
                });
                interaction.reply({
                    content: 'Kanal herkese kapatıldı.',
                    ephemeral: true
                });
            }
        };
    } else if (route === 'lock' && !hasOwneredChannel) {
        return interaction.reply({
            content: 'Özel oda bulunamadı.',
            ephemeral: true
        });
    }

    if (route === 'visible' && hasOwneredChannel) {
        const voiceChannel = interaction.guild?.channels.cache.get(hasOwneredChannel.channel);

        if (voiceChannel.parentId !== ertu.settings?.customRoomParent) {
            return interaction.reply({
                content: 'Bu komutu sadece özel oda kategorisinde kullanabilirsiniz.',
                ephemeral: true
            });
        };

        if (interaction.user.id !== hasOwneredChannel.owner) {
            return interaction.reply({
                content: 'Bu komutu sadece kendi odanızda kullanabilirsiniz.',
                ephemeral: true
            });
        }

        if (voiceChannel) {
            const permissions = voiceChannel.permissionOverwrites?.cache.find(
                perm => perm.id === interaction.guild.id
            );

            if (!permissions) {
                return interaction.reply({
                    content: 'Bu kanal için geçerli izinler bulunamadı.',
                    ephemeral: true
                });
            }

            if (permissions.deny.has(PermissionFlagsBits.ViewChannel)) {
                await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                    [PermissionFlagsBits.ViewChannel]: null
                });
                interaction.reply({
                    content: 'Kanal herkese görünür hale getirildi.',
                    ephemeral: true
                });
            } else {
                await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                    [PermissionFlagsBits.ViewChannel]: false
                });
                interaction.reply({
                    content: 'Kanal herkese gizlendi.',
                    ephemeral: true
                });
            }
        };
    } else if (route === 'visible' && !hasOwneredChannel) {
        return interaction.reply({
            content: 'Özel oda bulunamadı.',
            ephemeral: true
        });
    }

    if (route === 'member' && hasOwneredChannel) {
        const voiceChannel = interaction.guild?.channels.cache.get(hasOwneredChannel.channel);

        if (voiceChannel.parentId !== ertu.settings?.customRoomParent) {
            return interaction.reply({
                content: 'Bu komutu sadece özel oda kategorisinde kullanabilirsiniz.',
                ephemeral: true
            });
        };

        if (interaction.user.id !== hasOwneredChannel.owner) {
            return interaction.reply({
                content: 'Bu komutu sadece kendi odanızda kullanabilirsiniz.',
                ephemeral: true
            });
        }

        if (voiceChannel) {
            const allowedUsers = voiceChannel.permissionOverwrites.cache.filter(overwrite =>
                overwrite.allow.has(PermissionFlagsBits.Connect) && overwrite.type === 1
            );

            const allowedOptions = allowedUsers
                .filter(x => x.id !== interaction.user.id)
                .map(user => ({
                    label: interaction.guild.members.cache.get(user.id)?.displayName || `Kullanıcı: ${user.id}`,
                    value: user.id
                }));

            const stringSelectMenu = new StringSelectMenuBuilder({
                customId: 'remove_permission',
                placeholder: 'Özel odaya izinli kullanıcılar',
                options: allowedOptions.slice(0, 25).length > 0 ? allowedOptions.slice(0, 25) : [{
                    label: 'Kimse mevcut değil',
                    value: 'none',
                    description: 'Odaya izinli kullanıcı yok.'
                }],
                disabled: allowedOptions.length === 0
            });

            const userSelectMenu = new UserSelectMenuBuilder({
                customId: 'add_permission',
                placeholder: 'Üye seç.',
                maxValues: 1
            });

            const stringSelectRow = new ActionRowBuilder().addComponents(stringSelectMenu);
            const userSelectRow = new ActionRowBuilder().addComponents(userSelectMenu);

            await interaction.reply({
                content: 'Aşağıdaki menüleri kullanarak kullanıcı izinlerini düzenleyin:',
                components: [stringSelectRow, userSelectRow],
                ephemeral: true
            });

            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60000
            });

            collector.on('collect', async i => {
                if (i.customId === 'remove_permission') {
                    const userId = i.values[0];
                    await voiceChannel.permissionOverwrites.edit(userId, {
                        [PermissionFlagsBits.Connect]: false
                    });
                    await i.update({
                        content: `<@${userId}> kullanıcısının özel oda izni kaldırıldı.`,
                        components: [],
                        ephemeral: true
                    });
                } else if (i.customId === 'add_permission') {
                    const userId = i.values[0];
                    await voiceChannel.permissionOverwrites.edit(userId, {
                        [PermissionFlagsBits.Connect]: true
                    });
                    await i.update({
                        content: `<@${userId}> kullanıcısına özel odaya bağlanma izni verildi.`,
                        components: [],
                        ephemeral: true
                    });
                }
            });
        };
    } else if (route === 'member' && !hasOwneredChannel) {
        return interaction.reply({
            content: 'Özel oda bulunamadı.',
            ephemeral: true
        });
    }
}