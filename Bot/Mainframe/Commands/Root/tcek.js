const { PermissionsBitField: { Flags } } = require('discord.js');

const STAFF_ROLES = [
    '1338969167583379637',
    '1338969153868009613',
    '1338969161623408711',
    '1338969139267506216',
    '1338969135056420969',
    '1338969133957513246',
    '1339034429741600788',
    '1338969132904747129'
];

module.exports = {
    Name: 'toplanticek',
    Aliases: ['tçek'],
    Description: 'Belirli rollerden birine sahip yetkilileri kullanıcının bulunduğu ses kanalına çeker.',
    Usage: 'toplanticek',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {
        const kanal = message.member.voice.channel;
        if (!kanal) return message.reply('Bir ses kanalında olmalısınız.');
        if (kanal.parentId !== '1338969135845081141') return message.reply('Toplantı kanalı belirtilen kategoride (ID: 1338969135845081141) olmalı.');

        const members = await message.guild?.members.fetch();
        if (!members) return message.reply('Üyeler alınamadı.');

        const staffMembers = members.filter(m => STAFF_ROLES.some(roleId => m.roles.cache.has(roleId)) && !m.user.bot);
        if (staffMembers.size === 0) return message.reply('Bu rollerden herhangi birine sahip üye bulunmuyor.');

        for (const [id, member] of staffMembers) {
            if (member.voice.channel) {
                await member.voice.setChannel(kanal);
            }
        }

        client.toplantıKanal = kanal.id;
        message.reply('Yetkililer toplantı kanalına çekildi!');
    },
};