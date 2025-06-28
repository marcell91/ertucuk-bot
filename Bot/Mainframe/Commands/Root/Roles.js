const { ChannelType, PermissionFlagsBits } = require('discord.js')

module.exports = {
    Name: 'rolkur',
    Aliases: [],
    Description: 'Sunucu için emojileri oluşturur.',
    Usage: 'rolkur',
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
        const loadingMessage = await message.reply(`Roller oluşturuluyor...`)
        for (let index = 0; index < global.data.roles.length; index++) {
            let element = global.data.roles[index];
            await message.guild.roles.create({
                name: element.name,
                color: element.color
            })
        }

        loadingMessage.edit({ content: `Menü için gerekli Rollerin kurulumu başarıyla tamamlanmıştır.` })
    },
};