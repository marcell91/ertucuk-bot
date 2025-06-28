const { ActionRowBuilder, ButtonBuilder, ButtonStyle, RoleSelectMenuBuilder, UserSelectMenuBuilder, StringSelectMenuBuilder, codeBlock, EmbedBuilder } = require('discord.js');
const { SettingsModel } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    name: 'güvenli',
    aliases: ['whitelist', 'wl', 'g', 'gl'],

    execute: async (client, message, args) => {
        if (!['ekle', 'çıkar', 'liste'].some(x => args[0] == x)) return message.reply({ content: `Lütfen geçerli bir işlem belirtin. \`ekle\`, \`çıkar\`, \`liste\`` })

        if (args[0] === 'ekle') {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('addRole')
                    .setLabel('Rol Ekle')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('addUser')
                    .setLabel('Üye Ekle')
                    .setStyle(ButtonStyle.Primary)
            );

            const msg = await message.channel.send({
                content: `Whitelist'e ne eklemek istiyorsunuz?`,
                components: [row]
            });

            const collector = msg.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id, time: 45000
            });

            collector.on('collect', async i => {
                if (i.customId === 'addRole' || i.customId === 'addUser') {
                    i.deferUpdate();

                    const row = i.customId === 'addRole'
                        ? new RoleSelectMenuBuilder().setCustomId('whitelistRole').setPlaceholder('Rol Seç').setMaxValues(1)
                        : new UserSelectMenuBuilder().setCustomId('whitelistUser').setPlaceholder('Kullanıcı Seç').setMaxValues(1);

                    const selectionRow = new ActionRowBuilder().addComponents(row);

                    await msg.edit({
                        content: `Lütfen whitelist eklemek istediğiniz ${i.customId === 'addRole' ? 'rolü' : 'kullanıcıyı'} seçiniz.`,
                        components: [selectionRow]
                    });

                    const selectionCollector = msg.createMessageComponentCollector({
                        filter: i => i.user.id === message.author.id, time: 45000
                    });

                    selectionCollector.on('collect', async i => {
                        if (i.customId === 'whitelistRole' || i.customId === 'whitelistUser') {
                            i.deferUpdate();
                            const value = i.values[0];

                            const typeRow = new ActionRowBuilder().addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('whitelistType')
                                    .setPlaceholder('Whitelist Türü Seç')
                                    .addOptions([
                                        { label: 'Full (Riskli)', value: 'full' },
                                        { label: 'Sunucu Güncellemeleri', value: 'guildUpdate' },
                                        { label: 'Üye Güncellemeler (Ban, Kick, Rol)', value: 'memberUpdate' },
                                        { label: 'Kanal', value: 'channel' },
                                        { label: 'Rol', value: 'role' },
                                        { label: 'Emoji/Sticker', value: 'emoji' },
                                    ])
                            );

                            await msg.edit({
                                content: `Lütfen whitelist türünü seçiniz.`,
                                components: [typeRow]
                            });

                            const typeCollector = msg.createMessageComponentCollector({
                                filter: i => i.user.id === message.author.id, time: 45000
                            });

                            typeCollector.on('collect', async i => {
                                if (i.customId === 'whitelistType') {
                                    i.deferUpdate();
                                    const type = i.values[0];

                                    const limitRow = new ActionRowBuilder().addComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId('limitSelect')
                                            .setPlaceholder('Limit Seç')
                                            .addOptions([
                                                { label: '5', value: '5' },
                                                { label: '10', value: '10' },
                                                { label: '15', value: '15' },
                                                { label: '20', value: '20' },
                                                { label: '25', value: '25' },
                                                { label: '50', value: '50' },
                                                { label: '100', value: '100' },
                                                { label: '200', value: '200' },
                                                { label: '500', value: '500' },
                                                { label: '1000', value: '1000' },
                                            ])
                                    );

                                    await msg.edit({
                                        content: `Lütfen whitelist limiti seçiniz.`,
                                        components: [limitRow]
                                    });

                                    const limitCollector = msg.createMessageComponentCollector({
                                        filter: i => i.user.id === message.author.id, time: 45000
                                    });

                                    limitCollector.on('collect', async i => {
                                        if (i.customId === 'limitSelect') {
                                            i.deferUpdate();
                                            const limit = i.values[0];

                                            const punishRow = new ActionRowBuilder().addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId('punishSelect')
                                                    .setPlaceholder('Ceza Seç')
                                                    .addOptions([
                                                        { label: 'Ban', value: 'ban' },
                                                        { label: 'Kick', value: 'kick' },
                                                        { label: 'Y.Çek', value: 'pull' },
                                                    ])
                                            );

                                            await msg.edit({
                                                content: `Lütfen ceza tipini seçiniz.`,
                                                components: [punishRow]
                                            });

                                            const punishCollector = msg.createMessageComponentCollector({
                                                filter: i => i.user.id === message.author.id, time: 45000
                                            });

                                            punishCollector.on('collect', async i => {
                                                if (i.customId === 'punishSelect') {
                                                    i.deferUpdate();
                                                    const punish = i.values[0];

                                                    const document = await SettingsModel.findOne({ id: message.guild.id })
                                                    if (!document || !document.security.whitelist) return;

                                                    const findOld = document.security.whitelist.find((x) => x.key === value);
                                                    if (findOld) {
                                                        const sameType = findOld.access.find((x) => x.type === type);
                                                        if (sameType) {
                                                            sameType.limit = limit;
                                                            sameType.punish = punish;
                                                            await SettingsModel.updateOne(
                                                                { id: message.guild.id },
                                                                { $set: { 'security.whitelist': document.security.whitelist } }
                                                            );
                                                            await msg.edit({ content: `Whitelist başarıyla güncellendi!`, components: [] });
                                                            return;
                                                        };

                                                        findOld.access.push({ type, limit, punish });
                                                        await SettingsModel.updateOne(
                                                            { id: message.guild.id },
                                                            { $set: { 'security.whitelist': document.security.whitelist } }
                                                        );
                                                        await msg.edit({ content: `Whitelist başarıyla güncellendi!`, components: [] });
                                                        return;
                                                    }

                                                    document.security.whitelist.push({ key: value, access: [{ type, limit, punish }] });
                                                    await SettingsModel.updateOne(
                                                        { id: message.guild.id },
                                                        { $set: { 'security.whitelist': document.security.whitelist } }
                                                    );

                                                    await msg.edit({ content: `Whitelist başarıyla eklendi!`, components: [] });
                                                }
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
            });
        } else if (args[0] === 'çıkar') {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('removeRole')
                    .setLabel('Rol Çıkar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('removeUser')
                    .setLabel('Üye Çıkar')
                    .setStyle(ButtonStyle.Primary)
            );

            const msg = await message.channel.send({
                content: `Whitelist'den ne çıkarmak istiyorsunuz?`,
                components: [row]
            });

            const collector = msg.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id, time: 45000
            });

            collector.on('collect', async i => {
                if (i.customId === 'removeRole' || i.customId === 'removeUser') {
                    i.deferUpdate();

                    const row = i.customId === 'removeRole'
                        ? new RoleSelectMenuBuilder().setCustomId('whitelistRole').setPlaceholder('Rol Seç').setMaxValues(1)
                        : new UserSelectMenuBuilder().setCustomId('whitelistUser').setPlaceholder('Kullanıcı Seç').setMaxValues(1);

                    const selectionRow = new ActionRowBuilder().addComponents(row);

                    await msg.edit({
                        content: `Lütfen whitelist çıkarmak istediğiniz ${i.customId === 'removeRole' ? 'rolü' : 'kullanıcıyı'} seçiniz.`,
                        components: [selectionRow]
                    });

                    const selectionCollector = msg.createMessageComponentCollector({
                        filter: i => i.user.id === message.author.id, time: 45000
                    });

                    selectionCollector.on('collect', async i => {
                        if (i.customId === 'whitelistRole' || i.customId === 'whitelistUser') {
                            i.deferUpdate();
                            const value = i.values[0];

                            const document = await SettingsModel.findOne({ id: message.guild.id })
                            if (!document || !document.security.whitelist) return;

                            const findOld = document.security.whitelist.find((x) => x.key === value);
                            if (!findOld) return await msg.edit({ content: `Whitelist bulunamadı!`, components: [] });

                            document.security.whitelist = document.security.whitelist.filter((x) => x.key !== value);
                            await SettingsModel.updateOne(
                                { id: message.guild.id },
                                { $set: { 'security.whitelist': document.security.whitelist } }
                            );

                            await msg.edit({ content: `Whitelist başarıyla çıkarıldı!`, components: [] });
                        }
                    });
                }
            })
        } else if (args[0] === 'liste') {
            const document = await SettingsModel.findOne({ id: message.guild.id })
            if (!document || !document.security.whitelist) return;

            const whitelistData = document.security.whitelist.map((x) => {
                const roleOrUserName = message.guild?.roles.cache.has(x.key)
                    ? message.guild?.roles.cache.get(x.key)?.name
                    : message.guild?.members.cache.get(x.key)?.user?.username;

                const name = roleOrUserName || 'Bulunamadı';

                const roleOrUserType = message.guild?.roles.cache.has(x.key) ? '(Rol)' : '(Kullanıcı)';

                const accessContent = x.access.map((y) => {
                    const limit = y.limit || 'Limit yok';
                    const type = y.type || 'Bilinmiyor'
                    const punish = y.punish || 'Bilinmiyor';
                    return [
                        `→ Tip: ${type === 'full' ? 'Full Erişim' : type === 'guildUpdate' ? 'Sunucu Güncellemeleri' : type === 'memberUpdate' ? 'Üye Güncellemeleri' : type === 'channel' ? 'Kanal' : type === 'role' ? 'Rol' : 'Emoji/Sticker'}`,
                        `→ Limit: ${limit}`,
                        `→ Ceza: ${punish === 'pull' ? 'Y.Çek' : punish === 'ban' ? 'Ban' : 'Kick'}`
                    ].join('\n');
                }).join('\n\n');

                return accessContent
                    ? codeBlock('yaml', [`# ${name} ${roleOrUserType}`, accessContent].join('\n'))
                    : null;
            }).filter(Boolean);

            if (whitelistData.length === 0) {
                return await message.reply({ content: 'Whitelist bulunamadı.' });
            }

            let page = 1;
            const totalData = Math.ceil(whitelistData.length / 5);

            const question = await message.channel.send({
                embeds: [new EmbedBuilder({ description: whitelistData.slice(0, 5).join('\n') })],
                components: totalData > 1 ? [getButton(page, totalData)] : []
            })

            const collector = question.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id, time: 60000
            });

            collector.on('collect', async i => {
                if (i.customId === 'first') page = 1;
                if (i.customId === 'previous') page -= 1;
                if (i.customId === 'next') page += 1;
                if (i.customId === 'last') page = totalData;

                await i.deferUpdate();
                await question.edit({
                    embeds: [new EmbedBuilder({ description: whitelistData.slice((page - 1) * 5, page * 5).join('\n') })],
                    components: [getButton(page, totalData)]
                });
            });
        }
    }
}

function getButton(page, total) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('first')
                .setEmoji('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId('count')
                .setLabel(`${page}/${total}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(total === page),
            new ButtonBuilder()
                .setCustomId('last')
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === total),
        );
}