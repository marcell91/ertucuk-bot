const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock, bold } = require('discord.js');
const { UserModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'paragönder',
    Aliases: ['paragonder', 'pg', 'para-gönder', 'para-gonder'],
    Description: 'Belirtilen kişiye para gönderir.',
    Usage: 'paragönder <@User/ID> <miktar>',
    Category: 'Economy',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            client.embed(message, `Kullanıcı bulunamadı!`);
            return;
        }

        if (member.user.bot) {
            client.embed(message, 'Bot kullanıcı.');
            return;
        }

        if (member.id === message.author.id) {
            client.embed(message, 'Kendinize para gönderemezsiniz!');
            return;
        }

        const amount = Number(args[1])
        if (isNaN(amount)) {
            client.embed(message, 'Lütfen geçerli bir miktar giriniz!');
            return;
        }

        if (amount <= 0) {
            client.embed(message, 'Belirttiğiniz miktar geçersizdir!');
            return;
        }

        if (amount > document.inventory.cash) {
            client.embed(message, 'Yeterli paranız bulunmamaktadır.');
            return;
        }

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    custom_id: 'accept',
                    label: 'Onayla',
                    style: ButtonStyle.Success,
                    emoji: { id: await client.getEmojiID('check') },
                }),
                new ButtonBuilder({
                    custom_id: 'cancel',
                    label: 'İptal',
                    style: ButtonStyle.Danger,
                    emoji: { id: await client.getEmojiID('mark') },
                }),
            ],
        });

        const question = await message.reply({
            embeds: [
                new EmbedBuilder({
                    thumbnail: { url: member.displayAvatarURL({ dynamic: true }) },
                    timestamp: new Date(),
                    color: client.getColor('random'),
                    author: { name: `${message.author.username}, ${member.username} adlı kullanıcıya para göndermek üzeresin.`, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                    description: [
                        `Bu işlemi onaylamak için ${await client.getEmoji('check')} Onayla'ya tıklayın.`,
                        `Bu işlemi iptal etmek için ${await client.getEmoji('mark')} İptal'e tıklayın.`,
                        '',
                        ` ${message.author} kullanıcısın ${member} adlı kullanıcıya göndereceği miktar:\n${codeBlock('fix', client.functions.formatNumber(amount) + '$')}`
                    ].join('\n')
                })
            ],
            components: [row]
        });

        const filter = (i) => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (i) => {
            i.deferUpdate();

            if (i.customId === 'accept') {
                const userDocument = (await UserModel.findOne({ id: member.id })) || new UserModel({ id: member.id }).save();

                userDocument.inventory.cash += Number(amount)
                userDocument.markModified('inventory')
                document.inventory.cash -= Number(amount)
                document.markModified('inventory')

                await userDocument.save();
                await document.save(); 

                question.edit({
                    embeds: [],
                    content: `${await client.getEmoji('check')} ${message.author.username}, ${member} kullanıcısının bankasına ${client.functions.formatNumber(bold(amount + '$'))} gönderdi.`,
                    components: []
                });
            } else {
                question.edit({
                    embeds: [],
                    content: `${await client.getEmoji('mark')} işlem iptal edildi.`,
                    components: []
                });
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                question.edit({ components: [client.functions.timesUp()] });
            }
        });
    },
};