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

// Mesajı parçalara bölen fonksiyon
async function sendChunkedMessage(channel, content) {
    const MAX_LENGTH = 2000; // Discord’un normal mesaj limiti
    if (content.length <= MAX_LENGTH) {
        await channel.send(content);
        return;
    }

    const lines = content.split('\n');
    let chunk = '';
    for (const line of lines) {
        if ((chunk + line + '\n').length > MAX_LENGTH) {
            await channel.send(chunk);
            chunk = line + '\n';
        } else {
            chunk += line + '\n';
        }
    }
    if (chunk) await channel.send(chunk);
}

module.exports = {
    Name: 'toplantibitir',
    Aliases: ['tbitir'],
    Description: 'Toplantıyı bitirir, katılanlara rol verir ve katılmayanları kaydeder.',
    Usage: 'toplantibitir',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {
        if (!client.toplantıAktif) return message.reply('Aktif bir toplantı yok!');
        const kanal = client.channels.cache.get(client.toplantıKanal);
        if (!kanal) return message.reply('Toplantı kanalı bulunamadı.');

        const toplanti = await Toplanti.findById(client.toplantiId);
        if (!toplanti) return message.reply('Toplantı kaydı bulunamadı.');

        const members = await message.guild?.members.fetch();
        if (!members) return message.reply('Üyeler alınamadı.');

        const staffMembers = members.filter(m => STAFF_ROLES.some(roleId => m.roles.cache.has(roleId)) && !m.user.bot);
        if (staffMembers.size === 0) return message.reply('Bu rollerden herhangi birine sahip üye bulunmuyor.');

        // Katılanlara rol ver (ID: 1352691698765135893)
        for (const katilan of toplanti.katilanlar) {
            const member = message.guild.members.cache.get(katilan.userId);
            if (member && STAFF_ROLES.some(roleId => member.roles.cache.has(roleId)) && !member.user.bot) {
                await member.roles.add('1352691698765135893');
            }
        }

        // Katılmayanları hesapla ve formatla
        const katilanIds = toplanti.katilanlar.map(k => k.userId);
        const katılmayanlar = staffMembers.filter(member => !katilanIds.includes(member.id));
        let response = 'Toplantı bitti, katılanlara "Toplantıya Katıldı" rolü verildi.\n';
        if (katılmayanlar.size > 0) {
            const liste = katılmayanlar.map(m => `ID: ${m.id} | Kullanıcı Adı: ${m.user.tag} | Etiket: <@${m.id}>`).join('\n');
            response += `Katılmayanlar:\n${liste}`;
        } else {
            response += 'Katılmayan yok.';
        }

        client.toplantıAktif = false;
        await kanal.permissionOverwrites.edit(message.guild.roles.everyone, { [Flags.Speak]: null });
        if (client.toplantiInterval) clearInterval(client.toplantiInterval); // Interval’ı temizle
        delete client.toplantıKanal;
        delete client.toplantiId;

        // Mesajı parçalara bölerek gönder
        await sendChunkedMessage(message.channel, response);
    },
};