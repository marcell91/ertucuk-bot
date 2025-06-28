const { bold } = require('discord.js');
const { UserModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'ertutest',
    Aliases: [],
    Description: '.',
    Usage: '',
    Category: 'Root',
    Cooldown: 86400,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        const data = await UserModel.findOne({ id: message.author.id });
        const item = 'ring5'
        data.inventory[item] = (data.inventory[item] || 0) + 1
        data.markModified('inventory')
        await data.save()
    },
};
