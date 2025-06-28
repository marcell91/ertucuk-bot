const { bold } = require('discord.js');
const { UserModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'banka',
    Aliases: ['param', 'bankam', 'para','coin'],
    Description: 'Sunucudaki Paranızı Gösterir.',
    Usage: 'banka',
    Category: 'Economy',
    Cooldown: 10,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();
        message.reply({ content: `${message.author} bankanda ${bold(client.functions.formatNumber(document?.inventory?.cash || 0) + '$')} bulunmaktadır.` })
    },
};