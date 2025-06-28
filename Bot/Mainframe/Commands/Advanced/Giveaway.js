const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

module.exports = {
    Name: 'çekiliş',
    Aliases: ['giveaway', 'giveaways', 'cekilis'],
    Description: 'Çekiliş yapar.',
    Usage: 'çekiliş ',
    Category: 'Advanced',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const duration = args.length ? ms(args[0]) : undefined;
        if (!duration || isNaN(duration)) {
            message.channel.send({ content: 'Geçerli bir süre/kazanan/ödül belirtmelisin.' });
            return;
        }

        const winners = args.length ? parseInt(args[1]) : undefined;
        if (!winners || isNaN(winners) || winners <= 0) {
            message.channel.send({ content: 'Geçerli bir kazanan belirtmelisin.' });
            return;
        }

        const prize = args.slice(2).join(' ');
        if (!prize) {
            message.channel.send({ content: 'Geçerli bir ödül belirtmelisin.' });
            return;
        }

        if (message) message.delete().catch((err) => { err });
        client.giveawaysManager.start(message.channel, {
            duration: duration,
            winnerCount: parseInt(winners),
            prize: prize,
            messages: {
                giveaway: '🎉🎉 **ÇEKİLİŞ** 🎉🎉',
                giveawayEnded: '🎉🎉 **ÇEKİLİŞ BİTTİ** 🎉🎉',
                giveawayEndedButton: 'Çekilişe git.',
                title: '{this.prize}',
                inviteToParticipate: 'Katılmak için 🎉 tıklayın!',
                winMessage: 'Tebrikler, {winners}! **{this.prize}** kazandın!',
                drawing: 'Süre: {timestamp-relative} ({timestamp-default})',
                dropMessage: 'İlk katılan sen ol!',
                embedFooter: '{this.winnerCount} kazanan',
                noWinner: 'Kimse katılmadığı için çekiliş iptal edildi.',
                winners: 'Kazanan:',
                endedAt: 'Bitecek',
                hostedBy: 'Başlatan: {this.hostedBy}',
                participants: 'Katılımcı Sayısı: **{participants}**\nSon Katılan Üye: {member}',
            }
        })
    },
};