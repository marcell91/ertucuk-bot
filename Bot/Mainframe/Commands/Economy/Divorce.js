const { UserModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'boşan',
    Aliases: ['divorce'],
    Description: 'Evliliğinizi boşarsınız.',
    Usage: 'boşan',
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
        if (document.marriage.active === false) {
            client.embed(message, 'Evli değilsin ki gerizekalı')
            return;
        }

        const userDocument = (await UserModel.findOne({ id: document.marriage.married }));
        if (client.system.ownerID.includes(userDocument.id)) {
            client.embed(message, 'Görünüşe göre evlendiğin kişi bot sahibi veya sunucu sahibi olduğu için boşanamazsın.')
            return;
        }

        document.marriage.active = false;
        document.marriage.married = '';
        document.marriage.date = '';
        document.marriage.ring = '';
        document.markModified('marriage');
        await document.save();

        if (userDocument) {
            userDocument.marriage.active = false
            userDocument.marriage.married = ''
            userDocument.marriage.date = ''
            userDocument.marriage.ring = ''
            userDocument.markModified('marriage')
            await userDocument.save()
        }

        message.reply({ content: `${await client.getEmoji('check')} Başarıyla boşandınız!` })    
    },
};