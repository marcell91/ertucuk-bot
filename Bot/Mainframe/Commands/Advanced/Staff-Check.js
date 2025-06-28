const { PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'roldenetims',
    Aliases: ['rol', 'rd', 'rolden'],
    Description: 'Sunucudaki yetkili rollerini denetler.',
    Usage: 'roldenetim',
    Category: 'Advanced',
    Cooldown: 0,

    Permissions: {
        User: [Flags.Administrator, Flags.ManageRoles],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {
        const minStaffRole = message.guild?.roles.cache.get(ertu.settings.minStaffRole);
        if (!minStaffRole) return message.channel.send('Sunucuda minimum yetkili rolü bulunamadı.');

        const members = await message.guild?.members.fetch();
        if (!members) return message.channel.send('Üyeler alınamadı.');

        const staffMembers = members.filter(m => m.roles.highest.position >= minStaffRole.position && !m.user.bot);
        if (staffMembers.size === 0) return message.channel.send('Yetkili rolünde üye bulunmuyor.');

        const top = [];
        const middle = [];
        const sub = [];

        staffMembers.forEach((member) => {
            const { type } = client.staff.getRank(member, ertu);
            if (!type) return;
            if (type === 'top') top.push(member);
            if (type === 'middle') middle.push(member);
            if (type === 'sub') sub.push(member);
        });

        const formatCategory = async (category, name) => {
            const total = category.length;
            const online = category.filter(m => m.presence?.status !== 'offline').length;
            const inVoice = category.filter(m => m.voice.channel).length;
            const notInVoice = category.filter(m => m.presence?.status !== 'offline' && !m.voice.channel);
            const offline = category.filter(m => !m.presence || m.presence.status === 'offline');
        
            const notInVoiceMentions = notInVoice.length > 0 
                ? notInVoice.map(m => m.toString()).join(', ')
                : 'Kimse yok';
            const offlineMentions = offline.length > 0 
                ? offline.map(m => m.toString()).join(', ')
                : 'Kimse yok';
        
            const notInVoiceIds = notInVoice.length > 0 
                ? notInVoice.map(m => `<@${m.id}>`).join(', ')
                : 'Kimse yok';
            const offlineIds = offline.length > 0 
                ? offline.map(m => `<@${m.id}>`).join(', ')
                : 'Kimse yok';
        
            const generalEmbed = new EmbedBuilder()
                .setTitle(`${name}`)
                .setDescription(
                    `**Toplam Üye:** ${total}\n` +
                    `**Çevrimiçi:** ${online}\n` +
                    `**Ses Kanalında:** ${inVoice}`
                )
                .setColor('Blue');
        
            const notInVoiceEmbed = new EmbedBuilder()
                .setTitle(`${name} - Çevrimiçi & Seste Olmayan`)
                .setDescription(`**Sayı:** ${notInVoice.length}\n${notInVoiceMentions}`)
                .setColor('Orange');
        
            const offlineEmbed = new EmbedBuilder()
                .setTitle(`${name} - Çevrimdışı`)
                .setDescription(`**Sayı:** ${offline.length}\n${offlineMentions}`)
                .setColor('Red');
        
            await message.channel.send({ embeds: [generalEmbed] });
            await message.channel.send('```\n----------------------------------------\n```');
        
            await message.channel.send({ embeds: [notInVoiceEmbed] });
            if (notInVoice.length > 0) {
                const splitNotInVoiceIds = client.functions.splitMessage(`\`\`\`\n${notInVoiceIds}\n\`\`\``, { maxLength: 2000 });
                for (const part of splitNotInVoiceIds) {
                    await message.channel.send(part);
                }
            }
            await message.channel.send('```\n----------------------------------------\n```');
        
            await message.channel.send({ embeds: [offlineEmbed] });
            if (offline.length > 0) {
                const splitOfflineIds = client.functions.splitMessage(`\`\`\`\n${offlineIds}\n\`\`\``, { maxLength: 2000 });
                for (const part of splitOfflineIds) {
                    await message.channel.send(part);
                }
            }

            return { total, online, inVoice, notInVoice: notInVoice.length, offline: offline.length };
        };

        await message.channel.send('```diff\n! Yetkili Rolleri Denetim Raporu\n```');
        await message.channel.send('```\n----------------------------------------\n```');

        const topStats = await formatCategory(top, '➤ Üst Yönetim');
        await message.channel.send('```\n----------------------------------------\n```');

        const middleStats = await formatCategory(middle, '➤ Orta Yönetim');
        await message.channel.send('```\n----------------------------------------\n```');

        const subStats = await formatCategory(sub, '➤ Alt Yönetim');
        await message.channel.send('```\n----------------------------------------\n```');

        // Tüm verileri gösteren final embed
        const totalEmbed = new EmbedBuilder()
            .setTitle('Genel Denetim Özeti')
            .setColor('Purple')
            .addFields(
                { 
                    name: 'Üst Yönetim', 
                    value: `Toplam: ${topStats.total}\nÇevrimiçi: ${topStats.online}\nSes Kanalında: ${topStats.inVoice}\nSeste Olmayan: ${topStats.notInVoice}\nÇevrimdışı: ${topStats.offline}`,
                    inline: true 
                },
                { 
                    name: 'Orta Yönetim', 
                    value: `Toplam: ${middleStats.total}\nÇevrimiçi: ${middleStats.online}\nSes Kanalında: ${middleStats.inVoice}\nSeste Olmayan: ${middleStats.notInVoice}\nÇevrimdışı: ${middleStats.offline}`,
                    inline: true 
                },
                { 
                    name: 'Alt Yönetim', 
                    value: `Toplam: ${subStats.total}\nÇevrimiçi: ${subStats.online}\nSes Kanalında: ${subStats.inVoice}\nSeste Olmayan: ${subStats.notInVoice}\nÇevrimdışı: ${subStats.offline}`,
                    inline: true 
                },
                { 
                    name: 'Genel Toplam', 
                    value: `Toplam Üye: ${topStats.total + middleStats.total + subStats.total}\n` +
                           `Çevrimiçi: ${topStats.online + middleStats.online + subStats.online}\n` +
                           `Ses Kanalında: ${topStats.inVoice + middleStats.inVoice + subStats.inVoice}`,
                    inline: false 
                }
            )
            .setTimestamp();

        await message.channel.send({ embeds: [totalEmbed] });
    },
};