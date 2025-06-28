const { ChannelType, PermissionFlagsBits } = require('discord.js')

module.exports = {
    Name: 'logkur',
    Aliases: [],
    Description: 'Sunucu için log kanalları oluşturur.',
    Usage: 'logkur',
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

         const categorySettings = [
            { name: `${message.guild.name} | Loglar`, channels: client.data.logs },
            { name: `${message.guild.name} | Ceza İşlem`, channels: client.data.process }
        ];

        const loadingMessage = await message.reply(`Kanallar oluşturuluyor...`);

        for (const setting of categorySettings) {
            const category = await message.guild.channels.create({
                name: setting.name,
                type: ChannelType.GuildCategory,
                position: 99,
                permissionOverwrites: [{
                    id: message.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                }]
            });

            await Promise.all(
                Object.values(setting.channels).map(name => 
                    message.guild.channels.create({
                        name,
                        type: ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [{
                            id: message.guild.roles.everyone,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }]
                    })
                )
            );
        }

        await loadingMessage.edit('Kanallar oluşturuldu.');
    }
};