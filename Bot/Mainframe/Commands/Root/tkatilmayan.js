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
    Name: 'toplantikatilmayanlar',
    Aliases: ['tkatılmayan'],
    Description: 'Son toplantıya katılmayan belirli rollerden birine sahip yetkilileri listeler.',
    Usage: 'toplantikatilmayanlar',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {
        const members = await message.guild?.members.fetch();
        if (!members) return message.reply('Üyeler alınamadı.');

        const staffMembers = members.filter(m => STAFF_ROLES.some(roleId => m.roles.cache.has(roleId)) && !m.user.bot);
        if (staffMembers.size === 0) return message.reply('Bu rollerden herhangi birine sahip üye bulunmuyor.');

        const sonToplanti = await Toplanti.findOne().sort({ date: -1 });
        let response = '';
        if (sonToplanti) {
            const tarih = sonToplanti.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
            const katilanIds = sonToplanti.katilanlar.map(k => k.userId);
            const katılmayanlar = staffMembers.filter(member => !katilanIds.includes(member.id));

            response += `Son toplantı (${tarih}):\n`;
            if (katılmayanlar.size === 0) {
                response += 'Katılmayan yok.\n';
            } else {
                const liste = katılmayanlar.map(m => `ID: ${m.id} | Kullanıcı Adı: ${m.user.tag} | Etiket: <@${m.id}>`).join('\n');
                response += `Katılmayanlar:\n${liste}\n`;
            }
            const katilanListe = sonToplanti.katilanlar.map(k => `ID: ${k.userId} | Kullanıcı Adı: ${k.username} | Etiket: <@${k.userId}>`).join('\n') || 'Katılan yok.';
            response += `Katılanlar:\n${katilanListe}`;
        } else {
            response += 'Henüz kaydedilmiş bir toplantı verisi yok.';
        }

        // Mesajı parçalara bölerek gönder
        await sendChunkedMessage(message.channel, response);
    },
};