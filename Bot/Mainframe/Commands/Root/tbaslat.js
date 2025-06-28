const { PermissionsBitField: { Flags } } = require('discord.js');
const mongoose = require('mongoose');

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

// MongoDB Şeması
const ToplantiSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    katilanlar: [{
        userId: String,
        username: String
    }],
    kanalId: String
});
const Toplanti = mongoose.models.Toplanti || mongoose.model('Toplanti', ToplantiSchema);

module.exports = {
    Name: 'toplantibaslat',
    Aliases: ['tbaşlat'],
    Description: 'Toplantıyı kullanıcının bulunduğu kanalda başlatır ve katılanları anlık kaydeder.',
    Usage: 'toplantibaslat',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {
        if (client.toplantıAktif) return message.reply('Zaten bir toplantı aktif!');
        const kanal = message.member.voice.channel;
        if (!kanal) return message.reply('Bir ses kanalında olmalısınız.');
        if (kanal.parentId !== '1338969135845081141') return message.reply('Toplantı kanalı belirtilen kategoride (ID: 1338969135845081141) olmalı.');

        client.toplantıAktif = true;
        client.toplantıKanal = kanal.id;

        // MongoDB’de yeni toplantı kaydı oluştur
        const toplanti = await Toplanti.create({
            date: new Date(),
            katilanlar: [],
            kanalId: kanal.id
        });
        client.toplantiId = toplanti._id;

        // Mevcut kanaldaki STAFF_ROLES’a sahip kişileri anlık kaydet
        const members = await message.guild?.members.fetch();
        const staffMembers = members.filter(m => STAFF_ROLES.some(roleId => m.roles.cache.has(roleId)) && !m.user.bot);
        const mevcutKatilanlar = staffMembers.filter(m => m.voice.channelId === kanal.id);
        if (mevcutKatilanlar.size > 0) {
            const katilanListe = mevcutKatilanlar.map(m => ({
                userId: m.id,
                username: m.user.tag
            }));
            await Toplanti.updateOne(
                { _id: client.toplantiId },
                { $push: { katilanlar: { $each: katilanListe } } }
            );
        }

        // Periyodik kontrol (her 10 saniyede bir)
        client.toplantiInterval = setInterval(async () => {
            if (!client.toplantıAktif) return clearInterval(client.toplantiInterval);
            const updatedMembers = await message.guild?.members.fetch();
            const updatedStaff = updatedMembers.filter(m => STAFF_ROLES.some(roleId => m.roles.cache.has(roleId)) && !m.user.bot);
            const kanalUyeleri = updatedStaff.filter(m => m.voice.channelId === client.toplantıKanal);
            const mevcutKatilanIds = (await Toplanti.findById(client.toplantiId)).katilanlar.map(k => k.userId);
            const yeniKatilanlar = kanalUyeleri.filter(m => !mevcutKatilanIds.includes(m.id));

            if (yeniKatilanlar.size > 0) {
                const yeniKatilanListe = yeniKatilanlar.map(m => ({
                    userId: m.id,
                    username: m.user.tag
                }));
                await Toplanti.updateOne(
                    { _id: client.toplantiId },
                    { $push: { katilanlar: { $each: yeniKatilanListe } } }
                );
            }
        }, 10000); // 10 saniye

        await kanal.permissionOverwrites.edit(message.guild.roles.everyone, { [Flags.Speak]: false });
        message.reply('Toplantı başlatıldı, katılanlar anlık olarak MongoDB\'ye kaydediliyor.');
    },
};