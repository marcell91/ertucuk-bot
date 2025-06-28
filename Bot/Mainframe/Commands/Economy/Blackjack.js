const { UserModel } = require('../../../../Global/Settings/Schemas');
const BlackJack = require('../../../../Global/Base/Utils')

module.exports = {
    Name: 'blackjack',
    Aliases: ['bj'],
    Description: 'Blackjack oynamanıza yarar.',
    Usage: 'blackjack <10-10000-all>',
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

        const amount = Number(args[0])
        if (args[0] == 'all') {
            if (document.inventory.cash >= 10000) amount = 10000
            if (document.inventory.cash < 10000) amount = document.inventory.cash
            if (document.inventory.cash <= 0) amount = 10
        }

        if (isNaN(amount)) {
            client.embed(message, 'Lütfen geçerli bir miktar giriniz!');
            return;
        }

        if (amount <= 0) {
            client.embed(message, 'Belirttiğiniz miktar geçersizdir!');
            return;
        }

        if (amount > 10000) {
            client.embed(message, 'Maksimum miktar 10.000$ olabilir.');
            return;
        }

        if (amount < 10) {
            client.embed(message, 'Minumum miktar 10$ olabilir.');
            return;
        }

        if (amount > document.inventory.cash) {
            client.embed(message, 'Yeterli paranız bulunmamaktadır.');
            return;
        }

        document.inventory.cash -= Number(amount)
        document.markModified('inventory')

        const winAmount = Number(amount * 2)
        const game = await BlackJack(message, {
          buttons: true,
          transition: 'edit',
          bahis: amount,
          odul: winAmount,
          doubleodul: Number(winAmount * 2)
        })
    
        let point = 0
        if (game.ycard)
          game.ycard.forEach((c) => {
            point += c.value
          })
    
        if (game.result.includes('DOUBLE WIN') || game.result == 'BLACKJACK') {
          document.inventory.cash += Number(winAmount * 2)
        } else if (
          game.result.includes('WIN') ||
          game.result == 'SPLIT LOSE-WIN' ||
          game.result == 'SPLIT WIN-LOSE' ||
          game.result == 'SPLIT LOSE-DOUBLE WIN' ||
          game.result == 'SPLIT TIE-DOUBLE WIN' ||
          game.result == 'SPLIT DOUBLE WIN-TIE' ||
          game.result == 'SPLIT DOUBLE WIN-LOSE' ||
          game.result == 'SPLIT WIN-TIE' ||
          game.result == 'SPLIT TIE-WIN'
        ) {
          document.inventory.cash += Number(winAmount)
        } else if (game.result.includes('INSURANCE')) {
          document.inventory.cash += Number(winAmount)
        } else if (game.result.includes('TIE')) {
          document.inventory.cash += Number(winAmount)
        } else if (game.result == 'CANCEL' || game.result == 'TIMEOUT') {
        }
    
        document.markModified('inventory')
        document.save()
    },
};