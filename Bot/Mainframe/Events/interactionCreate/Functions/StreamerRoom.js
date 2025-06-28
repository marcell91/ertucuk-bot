const { PermissionFlagsBits, roleMention, channelMention, userMention, inlineCode, ActionRowBuilder, UserSelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');
const { SettingsModel } = require('../../../../../Global/Settings/Schemas');

module.exports = async function StreamerRoom(client, interaction, route, ertu) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member) return;

    if (!member.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has(ertu.settings.streamerRole)) {
        interaction.reply({ content: `Bu işlemi gerçekleştirmek için ${roleMention(ertu.settings.streamerRole)} rolüne sahip olmalısınız.`, ephemeral: true });
        return;
    }

    if (!member.voice.channelId) {
        interaction.reply({ content: 'Herhangi bir ses kanalında olmalısınız.', ephemeral: true });
        return;
    }

    const channel = member.voice.channel
    if (channel.parentId !== ertu.settings.streamerParent) {
        interaction.reply({ content: 'Streamer odalarında bulunmuyorsunuz.', ephemeral: true });
        return;
    }

    const hasAnotherOwner = ertu.streamerRooms.find((c) => c.channel === channel.id);
    const owneredChannel = ertu.streamerRooms.find(
        (room) => room.channel === channel.id && room.owner === interaction.user.id
    );

    if (route === 'claim') {
        if (owneredChannel) {
            interaction.reply({
                content: `${channelMention(owneredChannel.channel)} odasının sahibi zaten sizsiniz.`,
                ephemeral: true,
            });
            return;
        }

        if (hasAnotherOwner && hasAnotherOwner.owner !== interaction.user.id) {
            interaction.reply({
                content: `${userMention(hasAnotherOwner.owner)} (${inlineCode(hasAnotherOwner.owner)}) adlı kullanıcı odanın sahibi.`,
                ephemeral: true,
            });
            return;
        }

        await SettingsModel.updateOne(
            { id: interaction.guild.id },
            { $push: { streamerRooms: { channel: channel.id, owner: interaction.user.id, permissions: channel.permissionOverwrites.cache.map((c) => ({ id: c.id, allow: c.allow.bitfield.toString(), deny: c.deny.bitfield.toString() })) } } }
        );

        channel.permissionOverwrites.cache.forEach(p => p.edit({ MuteMembers: false }));
        channel.permissionOverwrites.create(interaction.user.id, { MuteMembers: true });

        interaction.reply({
            content: `${channel} adlı odanın sahibi artık sizsiniz`,
            ephemeral: true
        });
    }

    if (route === 'owner') {
        if (!owneredChannel) {
            interaction.reply({
                content: 'Odanın sahibi sen değilsin.',
                ephemeral: true,
            });
            return;
        }

        const row = new ActionRowBuilder({
            components: [
                new UserSelectMenuBuilder({
                    customId: 'select',
                    placeholder: 'Yeni sahibi seçin',
                    max_values: 1,
                    min_values: 1
                })
            ]
        })

        await interaction.reply({
            content: 'Aşağıdan yeni sahibi seçin.',
            components: [row],
            ephemeral: true
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'select') {
                const newOwner = i.values[0];
                const target = interaction.guild.members.cache.get(newOwner);
                if (!target) return;

                if (!target.voice.channel) {
                    i.reply({ content: 'Belirttiğin kişi herhangi bir ses kanalında bulunmuyor.', ephemeral: true });
                    return;
                }

                if (target.voice.channel.id !== channel.id) {
                    i.reply({ content: 'Belirttiğin kişi odada bulunmuyor.', ephemeral: true });
                    return;
                }

                if (!target.permissions.has(PermissionFlagsBits.Administrator) && !target.roles.cache.has(ertu.settings.streamerRole)) {
                    interaction.reply({ content: `Belirttiğin kişide ${roleMention(ertu.settings.streamerRole)} rolü bulunmamaktadır.`, ephemeral: true });
                    return;
                }

                await SettingsModel.updateOne(
                    { id: interaction.guild.id },
                    { $set: { 'streamerRooms.$[elem].owner': newOwner } },
                    { arrayFilters: [{ 'elem.channel': channel.id }] }
                );

                channel.permissionOverwrites.cache.forEach(p => p.edit({ MuteMembers: false }));
                channel.permissionOverwrites.create(target.id, { MuteMembers: true });

                i.reply({
                    content: `${channel} adlı odanın sahibi artık ${userMention(newOwner)} (${inlineCode(newOwner)})`,
                    ephemeral: true
                });
            }
        });
    }

    if (route === 'permission') {
        if (!owneredChannel) {
            interaction.reply({
                content: 'Odanın sahibi sen değilsin.',
                ephemeral: true,
            });
            return;
        }

        const row = new ActionRowBuilder({
            components: [
                new UserSelectMenuBuilder({
                    customId: 'select',
                    placeholder: 'Yayın izni verilecek kişiyi seçin',
                    max_values: 1,
                    min_values: 1
                })
            ]
        })

        await interaction.reply({
            content: 'Aşağıdan yayın izni verilecek kişiyi seçin.',
            components: [row],
            ephemeral: true
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'select') {
                const newOwner = i.values[0];
                const target = interaction.guild.members.cache.get(newOwner);
                if (!target) return;

                if (!target.voice.channel) {
                    i.reply({ content: 'Belirttiğin kişi herhangi bir ses kanalında bulunmuyor.', ephemeral: true });
                    return;
                }

                if (target.voice.channel.id !== channel.id) {
                    i.reply({ content: 'Belirttiğin kişi odada bulunmuyor.', ephemeral: true });
                    return;
                }

                if (!target.permissions.has(PermissionFlagsBits.Administrator) && !target.roles.cache.has(ertu.settings.streamerRole)) {
                    interaction.reply({ content: `Belirttiğin kişide ${roleMention(ertu.settings.streamerRole)} rolü bulunmamaktadır.`, ephemeral: true });
                    return;
                }

                const permission = channel.permissionOverwrites.cache.get(target.id);
                if (permission && permission.allow.has('Stream')) {
                    channel.permissionOverwrites.edit(target.id, { Stream: false });
                    i.reply({ content: `${userMention(newOwner)} (${inlineCode(newOwner)}) adlı kullanıcının yayın yapma izni kaldırıldı.`, ephemeral: true });
                } else {
                    channel.permissionOverwrites.edit(target.id, { Stream: true });
                    i.reply({ content: `${userMention(newOwner)} (${inlineCode(newOwner)}) adlı kullanıcıya yayın yapma izni verildi.`, ephemeral: true });
                }
            }
        });
    }

    if (route === 'settings') {
        if (!owneredChannel) {
            interaction.reply({
                content: 'Odanın sahibi sen değilsin.',
                ephemeral: true,
            });
            return;
        }

        const streamerRole = interaction.guild.roles.cache.get(ertu.settings.streamerRole);

        const muteSetting = channel.permissionOverwrites.cache.get(streamerRole.id);
        const streamSetting = channel.permissionOverwrites.cache.get(streamerRole.id);

        const muteStatus = muteSetting?.allow.has('Speak') || false;
        const streamStatus = streamSetting?.allow.has('Stream') || false;

        const row = new ActionRowBuilder({
            components: [
                new StringSelectMenuBuilder()
                    .setCustomId('settings_menu')
                    .setPlaceholder('Lütfen aşağıdan bir seçenek seçiniz.')
                    .addOptions([
                        {
                            label: 'Susturma Ayarı',
                            description: 'Üyeler odaya girdiklerinde otomatik olarak susturulsun mu?',
                            value: 'mute_settings',
                            emoji: muteStatus ? '❌' : '✅'
                        },
                        {
                            label: 'Yayın Ayarı',
                            description: 'Üyeler odaya girdiklerinde yayın açabilsin mi?',
                            value: 'stream_settings',
                            emoji: streamStatus ? '❌' : '✅'
                        }
                    ])
            ]
        });

        const msg = await interaction.reply({
            content: 'Lütfen aşağıdan bir seçenek seçiniz.',
            components: [row],
            ephemeral: true
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async i => {
            const value = i.values[0];

            if (value === 'mute_settings') {
                const streamerRole = interaction.guild.roles.cache.get(ertu.settings.streamerRole);
                const mutePermission = channel.permissionOverwrites.cache.get(streamerRole.id);
                const currentSetting = mutePermission?.deny.has('Speak') || false;

                await channel.permissionOverwrites.edit(streamerRole.id, {
                    Speak: currentSetting
                });

                await msg.edit({
                    content: `Üyeler odaya girdiklerinde ${currentSetting ? 'artık otomatik olarak susturulmayacak' : 'otomatik olarak susturulacak'}.`,
                    components: []
                });
            }

            if (value === 'stream_settings') {
                const streamerRole = interaction.guild.roles.cache.get(ertu.settings.streamerRole);
                const streamPermission = channel.permissionOverwrites.cache.get(streamerRole.id);
                const currentSetting = streamPermission?.allow.has('Stream') || false;

                await channel.permissionOverwrites.edit(streamerRole.id, {
                    Stream: !currentSetting
                });

                await msg.edit({
                    content: `Üyeler odaya girdiklerinde ${currentSetting ? 'artık yayın açamaz' : 'artık yayın açabilir'}.`,
                    components: []
                });
            }
        });
    }
}