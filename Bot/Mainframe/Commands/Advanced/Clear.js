const { PermissionsBitField: { Flags } } = require('discord.js');

module.exports = {
    Name: 'sil',
    Aliases: ['temizle'],
    Description: 'Kanalda belirtilen sayıda mesaj siler.',
    Usage: 'sil <mesaj sayısı>',
    Category: 'Advanced',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {

        const amount = args[0];
        if (!amount || isNaN(amount)) return client.embed(message, 'Lütfen silinecek mesaj sayısını belirtiniz!');
        if (amount < 1 || amount > 100) return client.embed(message, 'Lütfen 1-100 arasında bir sayı belirtiniz!');

        message.channel.bulkDelete(amount).catch(err => { });
        message.channel.send({
            embeds: [
                embed.setDescription(`Başarıyla ${amount} adet mesaj silindi!`)
            ]
        });
    },
};