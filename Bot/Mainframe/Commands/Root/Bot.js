const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

module.exports = {
    Name: 'bots',
    Aliases: [],
    Description: 'Sunucudaki botları yönetebilirsiniz.',
    Usage: 'bots <menüden bot seçin>',
    Category: 'Root',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {

        const botsData = []
        global.ertuBots.Main.forEach((client) => {
            botsData.push({
                value: client.id,
                description: `${client.id}`,
                label: `${client.bot.username}`,
                emoji: { id: '1171748850814423041' }
            })
        });

        global.ertuBots.Welcome.forEach((client) => {
            const member = message.guild?.members.cache.get(client.id)
            botsData.push({
                value: client.id,
                description: member?.voice.channel ? `${member?.voice.channel.name} Kanalının Ses Botu` : `${client.id}`,
                label: `${client.bot.username}`,
                emoji: { id: '1171748850814423041' }
            })
        });

        if (!botsData.length) return message.channel.send(`${await client.getEmoji('mark')} Sunucuda bot bulunamadı!`)

        const row = new ActionRowBuilder({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: 'bots:select',
                    placeholder: 'Güncellemek İstedigin Botu Seç',
                    options: botsData,
                })
            ]
        })

        message.channel.send({ content: `${await client.getEmoji('arrow')} Merhaba ${message.author} güncellemek istediğiniz botu aşağıdaki menüden seçebilirsiniz!`, components: [row] })
    },
};