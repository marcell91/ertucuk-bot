const { bold } = require('discord.js');
const { UserModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'daily',
    Aliases: ['günlük', 'günlükpara', 'dailycoin'],
    Description: 'Sunucudaki Günlük Hediyenizi Alırsınız.',
    Usage: 'daily',
    Category: 'Economy',
    Cooldown: 86400,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        let daily = Math.random()
        daily = daily * (5000 - 100)
        daily = Math.floor(daily) + 100
    
        await message.reply({ content: `Başarıyla günlük ödülünüzü alarak **${daily}$** kazandınız.` })
        await UserModel.updateOne({ id: message.author.id }, { $inc: { 'inventory.cash': daily } }, { upsert: true })
    },
};
