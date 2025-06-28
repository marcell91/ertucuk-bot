const { bold, EmbedBuilder, inlineCode, PermissionFlagsBits } = require('discord.js');
const { StaffModel, UserModel } = require('../../../../Global/Settings/Schemas');
const badgeConfig = require('../../../../Global/Settings/Server/BadgeRoles.json');
const rozetConfig = require('./rozet.config');

module.exports = {
    Name: 'rozet',
    Aliases: ['ystat', 'ys', 'rozetim'],
    Description: 'Yetkilinin rozet/görev/sorumluluk ilerlemesini gösterir.',
    Usage: 'rozet <@User/ID>',
    Category: 'General',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {
        // Yetki kontrolü - setup'tan ayarlanan rollere sahip kullanıcılar kullanabilir
        let allowedRoles = [];
        if (Array.isArray(ertu.settings?.taskPanelAuth)) allowedRoles = ertu.settings.taskPanelAuth;
        else if (ertu.settings?.taskPanelAuth) allowedRoles = [ertu.settings.taskPanelAuth];
        const hasPermission = allowedRoles.some(roleId => message.member.roles.cache.has(roleId));
        if (!hasPermission) {
            return message.channel.send({ 
                content: `${await client.getEmoji('mark')} Bu komutu kullanmak için yetkiniz bulunmuyor!` 
            });
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) return message.channel.send({ content: `Kullanıcı bulunamadı!` });

        // Rozet ve ana yetki rolleri rozetConfig üzerinden al
        let rozetBilgi = rozetConfig.yetkiler.map((yetki, i) => {
            const badge1 = yetki.badges[0] && member.roles.cache.has(yetki.badges[0]) ? `<@&${yetki.badges[0]}>` : null;
            const badge2 = yetki.badges[1] && member.roles.cache.has(yetki.badges[1]) ? `<@&${yetki.badges[1]}>` : null;
            const main = yetki.mainRole && member.roles.cache.has(yetki.mainRole) ? `<@&${yetki.mainRole}>` : null;
            const rozetler = [badge1, badge2].filter(Boolean).join(' ');
            return `${rozetler || 'Yok'}`;
        }).filter(line => line.includes('<@&')).join('\n\n');
        if (!rozetBilgi) rozetBilgi = 'Kullanıcının hiç rozeti veya ana yetkisi yok.';

        const loading = await message.channel.send(`Veriler alınıyor...`);

        const staffDocument = await StaffModel.findOne({ user: member.id });
        const userDocument = await UserModel.findOne({ id: member.id });
        if (!staffDocument || !userDocument) return loading.edit(`${await client.getEmoji('mark')} Belirttiğin kullanıcının hiç verisi yok!`);
        if (!staffDocument.tasks || !staffDocument.tasks.length) {
            return loading.edit(`${await client.getEmoji('mark')} Bu yetkilinin aktif bir görevi yok.`);
        }

        function calculatePercantage(document) {
            let total = 0;
            let count = 0;
            document.tasks.forEach((task) => {
                total += (task.count >= task.required ? task.required : task.count) / task.required * 100
                count++;
            });
            return count ? (total / count).toFixed(2) : 0;
        }
        function formatDurations(ms) {
            const totalSeconds = Math.floor(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            return `${String(hours).padStart(2, '')}`;
        }
        async function control(client, taskData) {
            const { count, required, type } = taskData;
            const currentData = ['AFK', 'STREAMER', 'PUBLIC'].includes(type) ? formatDurations(count) : count;
            const requiredData = ['AFK', 'STREAMER', 'PUBLIC'].includes(type) ? formatDurations(required) + ' saat' : required + ' adet';
            if (count >= required) {
                return `${await client.getEmoji('check')}`
            }
            return `${currentData}/${requiredData}`
        }
        async function controlNoBar(client, taskData) {
            const { count, required, type, name } = taskData;
            // Saat olarak gösterilecek tipler
            const hourTypes = ['AFK', 'STREAMER', 'PUBLIC', 'Public Ses', 'Streamer Ses', 'Afk Ses'];
            if (count >= required) return `${await client.getEmoji('check')}`;
            if (hourTypes.includes(type) || hourTypes.includes(name)) {
                const c = Math.floor(count / 3600000);
                const r = Math.floor(required / 3600000);
                return `(${c}/${r} saat)`;
            }
            return `(${count}/${required} adet)`;
        }

        const dot = client.getEmoji('arrow')
        const badgeStart = staffDocument.taskStartAt || staffDocument.startAt;
        const badgeDays = badgeStart ? Math.floor((Date.now() - badgeStart) / (1000 * 60 * 60 * 24)) : 0;
        const badgeDuration = `${badgeDays} / 14 gün`;

        const lastSeenMessage = userDocument.lastSeen?.message
            ? `<t:${Math.floor(new Date(userDocument.lastSeen.message).getTime() / 1000)}:R>`
            : "Veri yok";
        const lastSeenVoice = userDocument.lastSeen?.voice
            ? `<t:${Math.floor(new Date(userDocument.lastSeen.voice).getTime() / 1000)}:R>`
            : "Veri yok";

        const rozetEmbed = new EmbedBuilder({
            author: { name: member.user.username, icon_url: member.user.displayAvatarURL() },
            description: [
                `${await client.getEmoji('arrow')} ${member} adlı yetkilinin rozet durumu;`,
                '',
                `${await client.getEmoji('point')} ${bold('Genel Bilgiler;')}`,
                `${await client.getEmoji('point')} ${inlineCode('Seçim Tarihi :')} ${client.timestamp(badgeStart)}`,
                `${await client.getEmoji('point')} ${inlineCode('Son Görülme  :')} ${lastSeenMessage} ${await client.getEmoji('chat')} / ${lastSeenVoice} ${await client.getEmoji('ses')}`,
                `${await client.getEmoji('point')} ${inlineCode('İlerleme     :')} ${await client.functions.createBar(client, calculatePercantage(staffDocument), 100)} (%${calculatePercantage(staffDocument)})`,
                `${await client.getEmoji('point')} ${inlineCode('Seçtiği Görev:')} ${staffDocument.taskName || 'Görev seçilmemiş'}`,
                '',
                `${await client.getEmoji('arrow')} ${bold('Görevler;')}`,
                `${(await Promise.all(staffDocument.tasks.map(async t => `${await client.getEmoji('point')} ${inlineCode(t.name.padEnd(15, ' ') + ' :')} ${await controlNoBar(client, t)}`))).join('\n')}`,
                '',
                `${await client.getEmoji('point')} ${inlineCode('Rozet Süresi :')} ${badgeDuration}`,
                `${await client.getEmoji('point')} ${inlineCode('Rozet        :')} ${rozetBilgi}`,
                `${await client.getEmoji('point')} ${inlineCode('Görev        :')} ${await client.functions.createBar(client, calculatePercantage(staffDocument), 100)} (%${calculatePercantage(staffDocument)})`,
                `${await client.getEmoji('point')} ${inlineCode('Sorumluluk   :')} ${await client.functions.createBar(client, 0, 100)} (%0.00)`,
                `${await client.getEmoji('point')} ${inlineCode('Durum        :')} Devam etmelisin (Kalan: ${(100 - calculatePercantage(staffDocument)).toFixed(2)})`,
            ].join('\n'),
        });
        await loading.edit({ content: null, embeds: [rozetEmbed] });

        // Son görülme güncelle (komut çalışınca)
        await UserModel.updateOne(
            { id: member.id },
            { $set: { "lastSeen.message": new Date() } },
            { upsert: true }
        );
        if (member.voice && member.voice.channelId) {
            await UserModel.updateOne(
                { id: member.id },
                { $set: { "lastSeen.voice": new Date() } },
                { upsert: true }
            );
        }
    },
};