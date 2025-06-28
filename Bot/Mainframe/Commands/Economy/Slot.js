const { EmbedBuilder } = require('discord.js');
const { UserModel } = require('../../../../Global/Settings/Schemas');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    Name: 'slot',
    Aliases: ['s', 'slots'],
    Description: 'Ultra görsel slot oyunu!',
    Usage: 'slot <miktar>',
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

        const amount = Number(args[0]);
        if (args[0] == 'all') {
            if (document.inventory.cash >= 10000) amount = 10000;
            if (document.inventory.cash < 10000) amount = document.inventory.cash;
            if (document.inventory.cash <= 0) amount = 10;
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

        document.inventory.cash -= Number(amount);
        document.markModified('inventory');

        const symbols = {
            '💎': { emoji: '💎', multiplier: 8, luck: 5, name: 'Elmas', color: '#00ffff' },
            '🎰': { emoji: '🎰', multiplier: 6, luck: 10, name: 'Slot', color: '#ff00ff' },
            '7️⃣': { emoji: '7️⃣', multiplier: 4, luck: 20, name: 'Yedi', color: '#ff0000' },
            '🍒': { emoji: '🍒', multiplier: 3, luck: 25, name: 'Kiraz', color: '#ff0000' },
            '🍋': { emoji: '🍋', multiplier: 2, luck: 30, name: 'Limon', color: '#ffff00' },
            '🍎': { emoji: '🍎', multiplier: 1.5, luck: 30, name: 'Elma', color: '#00ff00' }
        };

        const gameMsg = await message.channel.send({
            embeds: [
                new EmbedBuilder({
                    description: [
                        '**🎰 SLOT MAKİNESİ**',
                        '```',
                        '╔══════════╗',
                        '║ ? ? ? ║',
                        '╚══════════╝',
                        '```',
                        `**💰 Bahis:** ${amount}$`
                    ].join('\n')
                })
            ]
        });

        const spins = ['🔄', '🎲', '🎯', '🎪', '🎨'];
        for (let i = 0; i < 3; i++) {
            for (const spin of spins) {
                await gameMsg.edit({
                    embeds: [
                        new EmbedBuilder({
                            description: [
                                '**🎰 SLOT MAKİNESİ**',
                                '```',
                                '╔══════════╗',
                                `║ ${spin} ${spin} ${spin}║`,
                                '╚══════════╝',
                                '```',
                                `**💰 Bahis:** ${amount}$`
                            ].join('\n')
                        })
                    ]
                });
                await wait(300);
            }
            }

        const slot1 = selectSymbol(symbols);
        const slot2 = selectSymbol(symbols);
        const slot3 = selectSymbol(symbols);

        let gains = 0;
        let resultTitle = '';
        let streakBonus = '';
        let color = client.getColor('red');

        if (slot1.emoji === slot2.emoji && slot2.emoji === slot3.emoji) {
            gains = Math.floor(amount * slot1.multiplier * 3);
            resultTitle = `🌟 MEGA JACKPOT! (x${slot1.multiplier * 3})`;
            color = client.getColor('green')
            document.games.currentStreak++;
            document.games.totalWins++;
            const bonusPercent = document.games.currentStreak * 10;
            streakBonus = `\n🔥 **Streak Bonus:** +${bonusPercent}%`;
            gains += Math.floor(gains * (bonusPercent / 100));
            document.inventory.cash += gains;
        } else if (slot1.emoji === slot2.emoji || slot2.emoji === slot3.emoji || slot1.emoji === slot3.emoji) {
            const matchedSymbol = slot1.emoji === slot2.emoji ? slot1 : slot2.emoji === slot3.emoji ? slot2 : slot1;
            gains = Math.floor(amount * matchedSymbol.multiplier);
            resultTitle = `✨ İKİLİ EŞLEŞME! (x${matchedSymbol.multiplier})`;
            color = client.getColor('green')
            document.games.currentStreak++;
            document.games.totalWins++;
            const bonusPercent = document.games.currentStreak * 5;
            streakBonus = `\n🎯 **Streak Bonus:** +${bonusPercent}%`;
            gains += Math.floor(gains * (bonusPercent / 100));
            document.inventory.cash += gains;
        } else {
            resultTitle = '💔 Kaybettin!';
            document.games.currentStreak = 0;
            document.games.totalLosses++;
        }

        document.games.maxStreak = Math.max(document.games.maxStreak, document.games.currentStreak);
        document.markModified('games');
        await document.save();

        const multiplierTable = Object.entries(symbols).map(([_, data]) => `${data.emoji} = x${data.multiplier}`).join(' | ');

        await gameMsg.edit({
            embeds: [
                new EmbedBuilder({
                    color: color,
                    footer: {
                        text: `Streak: ${document.games.currentStreak} | W: ${document.games.totalWins} | L: ${document.games.totalLosses}`,
                        iconURL: message.author.displayAvatarURL()
                    },
                    description: [
                        `**${resultTitle}**`,
                        '```',
                        '╔══════════╗',
                        `║ ${slot1.emoji}${slot2.emoji}${slot3.emoji}  ║`,
                        '╚══════════╝',
                        '```',
                        streakBonus,
                        `**💰 Bahis:** ${amount}$`,
                        `**💸 Kazanç:** ${gains}$`,
                        '',
                        '**🎰 Kazanç Tablosu**',
                        multiplierTable
                    ].join('\n')
                })
            ]
        });

        if (gains > amount * 5) {
            setTimeout(() => {
                message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffd700')
                            .setDescription('🌟 **BÜYÜK KAZANÇ!** Tebrikler! 🌟')
                    ]
                });
            }, 500);
        }
    },
};

function selectSymbol(symbols) {
    const totalLuck = Object.values(symbols).reduce((acc, curr) => acc + curr.luck, 0);
    let random = Math.random() * totalLuck;

    for (const symbol of Object.values(symbols)) {
        if (random < symbol.luck) return symbol;
        random -= symbol.luck;
    }
    return Object.values(symbols)[0];
}