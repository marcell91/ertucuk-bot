const { bold, EmbedBuilder } = require('discord.js');
const { UserModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'evlilik',
    Aliases: ['kocam', 'karım', 'karim', 'sevgilim', 'manitam'],
    Description: 'Evlendiginiz kisiyi gosterir.',
    Usage: 'evlilik',
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
        const marriage = document.marriage

        if (marriage.active === false) {
            client.embed(message, 'Sen yapayalnızsın ezik sevgilin yok :smile:');
            return;
        }

        const user = await client.users.fetch(marriage.married)
        const ring = marriage.ring
        const date = client.timestamp(marriage.date)

        let thumbnailURL;
        let description;

        if (ring === 1) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334384558110'
            description = 'Pırlanta'
        } else if (ring === 2) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334036693004'
            description = 'Baget'
        } else if (ring === 3) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334003138570'
            description = 'Tektaş'
        } else if (ring === 4) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393335819272203.gif'
            description = 'Tria'
        } else if (ring === 5) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393335915479040.gif'
            description = 'Beştaş'
        }

        const embed = new EmbedBuilder({
            author: { name: `${message.author.username}, ${user.username} ile evlisiniz!` },
            timestamp: new Date(),
            thumbnail: { url: thumbnailURL },
            footer: { text: description + ' Yüzük', iconURL: thumbnailURL },
            description: `${date} tarihinden beri evlisiniz! ${bold(description)} yüzüğünüzle mutluluğunuz daim olsun!`
        })

        message.reply({ embeds: [embed] })
    },
};