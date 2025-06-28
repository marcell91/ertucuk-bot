const { UserModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'parayükle',
    Aliases: ['parayukle', 'paraekle'],
    Description: 'Bir üyeye dilediğiniz miktarda para eklersiniz.',
    Usage: 'parayükle <@User/ID> <miktar>',
    Category: 'Root',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            client.embed(message, `Kullanıcı bulunamadı!`);
            return;
        }

        if (member.user.bot) {
            client.embed(message, 'Bot kullanıcı.');
            return;
        } 

        if (isNaN(args[1])) {
            client.embed(message, 'Lütfen geçerli bir miktar giriniz.');
            return;
        }

        if (args[1] <= 0) {
            client.embed(message, 'Belirttiğiniz miktar geçersizdir.');
            return;
        }

        const document = (await UserModel.findOne({ id: member.id })) || new UserModel({ id: member.id }).save();
        document.inventory.cash += Number(args[1])
        document.markModified('inventory')
        await document.save()

        message.reply({ content: `Başarıyla ${member} kullanıcısının bankasına ${client.functions.formatNumber(args[1])}$ yüklediniz.` })
    },
};
