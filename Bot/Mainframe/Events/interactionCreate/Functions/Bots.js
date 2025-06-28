const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock } = require('discord.js')

module.exports = async function Bots(client, interaction, route, ertu) {
    if (route === 'select') {
        const value = interaction.values[0];
        if (!value) return interaction.reply({ content: `${await client.getEmoji('mark')} Bir bot seçimi yapmalısın.`, ephemeral: true });

        const botClient = global.ertuBots.Main.find((c) => c.id === value) || global.ertuBots.Welcome.find((c) => c.id === value);

        const bot = interaction.guild.members.cache.get(value)
        if (!botClient) return interaction.reply({ content: `${await client.getEmoji('mark')} Belirtilen bot bulunamadı.`, ephemeral: true });

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder()
                    .setCustomId('bots:avatar')
                    .setLabel('Avatar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('bots:name')
                    .setLabel('İsmi')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('bots:bio')
                    .setLabel('Biyografi')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('bots:banner')
                    .setLabel('Banner')
                    .setStyle(ButtonStyle.Primary),
            ]
        });

        const banner = await bot.user.bannerURL({ dynamic: true });

        const embed = new EmbedBuilder({
            author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() },
            color: client.getColor('random'),
            description: `${bot.user} adlı botun bilgileri aşağıda belirtilmiştir. Güncellemeler yapmak için aşağıdaki butonlardan birini seçebilirsin.`,
            fields: [
                { name: 'İsmi', value: `${bot.user.username}`, inline: true },
                { name: 'Avatar', value: `[Görüntüle](${bot.user.avatarURL({ dynamic: true })})`, inline: true },
                { name: 'Banner', value: banner ? `[Görüntüle](${banner})` : 'Bulunamadı!', inline: true },
                { name: 'Biyografi', value: `${codeBlock('fix', `${botClient.description || 'Biyografi Bulunmuyor.'}`)}`, inline: false },
            ]
        });

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    if (route === 'avatar') {
        const bot = await interaction.guild.members.cache.get(interaction.message.embeds[0].description.match(/<@(\d+)>/) ? interaction.message.embeds[0].description.match(/<@(\d+)>/)[1] : null);
        if (!bot) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id);
        if (!Client) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const load = await interaction.reply({
            content: `${await client.getEmoji('arrow')} Botun yeni avatarını girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsin..`,
            ephemeral: true
        });

        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(await client.getEmoji('check'));
                return collector.stop()
            }

            const avatar = msg.attachments.first() ? msg.attachments.first()?.url : null
            if (!avatar) {
                load.edit({ content: `${await client.getEmoji('mark')} Lütfen bir avatar yükleyin.`, ephemeral: true })
                if (msg) msg.react(await client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(await client.getEmoji('check'));
            await client.updateClient(Client.token, avatar, 'avatar').then(async () => {
                load.edit({
                    content: `${await client.getEmoji('check')} Botunuzun adı başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }

    if (route === 'name') {
        const bot = await interaction.guild.members.cache.get(interaction.message.embeds[0].description.match(/<@(\d+)>/) ? interaction.message.embeds[0].description.match(/<@(\d+)>/)[1] : null);
        if (!bot) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id);
        if (!Client) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const load = await interaction.reply({
            content: `${await client.getEmoji('arrow')} Botun yeni ismini girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsiniz.`,
            ephemeral: true
        });

        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(await client.getEmoji('check'));
                return collector.stop()
            }

            const name = msg.content
            if (!name) {
                load.edit({ content: `${await client.getEmoji('mark')} Lütfen bir isim girin.`, ephemeral: true })
                if (msg) msg.react(await client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(await client.getEmoji('check'));
            await client.updateClient(Client.token, name, 'username').then(async () => {
                load.edit({
                    content: `${await client.getEmoji('check')} Botunuzun adı başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }

    if (route === 'bio') {
        const bot = await interaction.guild.members.cache.get(interaction.message.embeds[0].description.match(/<@(\d+)>/) ? interaction.message.embeds[0].description.match(/<@(\d+)>/)[1] : null);
        if (!bot) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id);
        if (!Client) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const load = await interaction.reply({
            content: `${await client.getEmoji('arrow')} Botun yeni biyografisini girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsiniz.`,
            ephemeral: true
        });

        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(await client.getEmoji('check'));
                return collector.stop()
            }

            const bio = msg.content
            if (!bio) {
                load.edit({ content: `${await client.getEmoji('mark')} Lütfen bir biyografi girin.`, ephemeral: true })
                if (msg) msg.react(await client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(await client.getEmoji('check'));
            await client.updateClient(Client.token, bio, 'bio').then(async () => {
                load.edit({
                    content: `${await client.getEmoji('check')} Botunuzun biyografisi başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }

    if (route === 'banner') {
        const bot = await interaction.guild.members.cache.get(interaction.message.embeds[0].description.match(/<@(\d+)>/) ? interaction.message.embeds[0].description.match(/<@(\d+)>/)[1] : null);
        if (!bot) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id);
        if (!Client) return interaction.reply({ content: `${await client.getEmoji('arrow')} Bot bulunamadı!`, ephemeral: true });

        const load = await interaction.reply({
            content: `${await client.getEmoji('arrow')} Botun yeni bannerını girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsiniz.`,
            ephemeral: true
        });

        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(await client.getEmoji('check'));
                return collector.stop()
            }

            const banner = msg.attachments.first() ? msg.attachments.first()?.url : null
            if (!banner) {
                load.edit({ content: `${await client.getEmoji('mark')} Lütfen bir banner yükleyin.`, ephemeral: true })
                if (msg) msg.react(await client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(await client.getEmoji('check'));
            await client.updateClient(Client.token, banner, 'banner').then(async () => {
                load.edit({
                    content: `${await client.getEmoji('check')} Botunuzun bannerı başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }
}