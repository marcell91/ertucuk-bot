const { Events, codeBlock, inlineCode, bold, EmbedBuilder,  } = require('discord.js');
const { Presence } = require('../../../Global/Helpers');
const { SettingsModel, PunitiveModel } = require('../../../Global/Settings/Schemas')

module.exports = {
    Name: Events.ClientReady,
    System: true,

    execute: async (client) => {
        Presence(client);
        const channel = client.channels.cache.get(client.system.channelID);
        if (channel) await channel.join({ selfDeaf: true, selfMute: true, Interval: true });

        const guild = client.guilds.cache.get(client.system.serverID);
        if (!guild) return client.logger.error('Failed to fetch server data.', `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=bot+applications.commands`);

        const document = await SettingsModel.findOne({ id: guild.id });
        const { settings, systems } = document

        await guild.watcher()

        async function checkUnregisters() {
            const noRoleMembers = guild.members.cache.filter(m => m.roles.cache.filter(r => r.id !== guild.id).size == 0)
            noRoleMembers.forEach(member => {
                if (member.manageable) member.setNickname(`${member.tag()} İsim | Yaş`).catch();
                if (member.manageable) member.setRoles(settings.unregisterRoles).catch()
            })
        }

        async function checkTaggeds() {
            const taggedMembers = guild.members.cache.filter((m) =>
                [...settings.manRoles, ...settings.womanRoles, ...settings.unregisterRoles].some((role) => m.roles.cache.some((r) => r.name === role)) &&
                settings.familyRole && !m.roles.cache.has(settings.familyRole) &&
                m.user.displayName.toLowerCase().includes(settings.tag) && m.manageable
            );

            const bannedTaggedMembers = guild.members.cache.filter((m) =>
                [...settings.manRoles, ...settings.womanRoles, ...settings.unregisterRoles].some((role) => m.roles.cache.some((r) => r.name === role)) &&
                settings.bannedTagRole && !m.roles.cache.has(settings.bannedTagRole) &&
                settings.bannedTags.some((tag) => m.user.displayName.toLowerCase().includes(tag.toLowerCase())) && m.manageable
            );

            if (settings.tag && settings.familyRole) taggedMembers.forEach(async (m) => {
                m.setNickname(m.displayName.replace(settings.secondTag, settings.tag)).catch(() => null);
                client.await(2000).then(() => m.roles.add(settings.familyRole).catch(() => null));

                const taggedMembers = guild.members.cache.filter((m) => m.user.displayName.includes(settings.tag)).size;
                const procentTaggedMembers = (taggedMembers / guild.memberCount * 100).toFixed(2);

                await client.getChannel('tag-alanlar', guild)?.send({
                    flags: [4096],
                    embeds: [new EmbedBuilder({
                        color: client.getColor('green'),
                        title: 'Taglı Üye Tespit Edildi',
                        description: [
                            `${m} adlı üye taglı (${inlineCode(settings.tag)}) olduğu için kayıt işlemi başlatıldı.`,
                            codeBlock('yaml', [
                                `# Bilgilendirme`,
                                `→ ${tag} tagına sahip üye sayısı ${taggedMembers} oldu.`,
                                `→ Sunucunun taglı üye oranı: %${procentTaggedMembers}`,
                                `→ Kullanıcı: ${m.user.tag} (${m.user.id})`,
                                `→ Tarih: ${client.functions.date(Date.now())}`,
                            ].join('\n')),
                        ].join('\n'),
                    })]
                }).catch(() => null);
            });

            if ([...settings.bannedTags].length && settings.bannedTagRole) bannedTaggedMembers.forEach(async (m) => {
                m.setNickname(m.displayName.replace(settings.secondTag, '[YASAKLI-TAG]').replace(settings.tag, '[YASAKLI-TAG]')).catch(() => null);
                client.await(2000).then(() => m.roles.add(settings.bannedTagRole).catch(() => null));

                const tag = settings.bannedTags.find((tag) => m.user.displayName.includes(tag));
                await client.getChannel('yasaklıtag-log', guild)?.send({
                    flags: [4096],
                    embeds: [new EmbedBuilder({
                        color: client.getColor('red'),
                        title: 'Yasaklı Taglı Üye Tespit Edildi',
                        description: [
                            `${m} adlı üye yasaklı taglı (${inlineCode(tag)}) olduğu için rolleri geri alındı.`,
                            codeBlock('yaml', [
                                `# Bilgilendirme`,
                                `→ Kullanıcı: ${m.user.tag} (${m.user.id})`,
                                `→ Tarih: ${client.functions.date(Date.now())}`,
                            ].join('\n')),
                        ].join('\n'),
                    })]
                }).catch(() => null);
            });
        }

        async function checkUnTaggeds() {
            const unTaggedMembers = guild.members.cache.filter((m) =>
                [...settings.manRoles, ...settings.womanRoles, ...settings.unregisterRoles].some((role) => m.roles.cache.some((r) => r.name === role)) &&
                settings.familyRole && m.roles.cache.has(settings.familyRole) &&
                !m.user.displayName.toLowerCase().includes(settings.tag) && m.manageable
            );

            const bannedTaggedMembers = guild.members.cache.filter((m) =>
                [...settings.manRoles, ...settings.womanRoles, ...settings.unregisterRoles].some((role) => m.roles.cache.some((r) => r.name === role)) &&
                settings.bannedTagRole && m.roles.cache.has(settings.bannedTagRole) &&
                !settings.bannedTags.some((tag) => m.user.displayName.toLowerCase().includes(tag.toLowerCase())) && m.manageable
            );

            if (settings.tag && settings.familyRole) unTaggedMembers.forEach(async (m) => {
                m.setNickname(m.displayName.replace(settings.tag, settings.secondTag)).catch(() => null);
                client.await(2000).then(() => m.roles.remove(settings.familyRole).catch(() => null));

                const taggedMembers = guild.members.cache.filter((m) => m.user.displayName.includes(settings.tag)).size;
                const procentTaggedMembers = (taggedMembers / guild.memberCount * 100).toFixed(2);

                await client.getChannel('tag-salanlar', guild)?.send({
                    flags: [4096],
                    embeds: [new EmbedBuilder({
                        color: client.getColor('red'),
                        title: 'Tagsız Üye Tespit Edildi',
                        description: [
                            `${m} adlı üye taglı (${inlineCode(settings.tag)}) olmadığı için rolleri geri alındı.`,
                            codeBlock('yaml', [
                                `# Bilgilendirme`,
                                `→ ${tag} tagına sahip üye sayısı ${taggedMembers} oldu.`,
                                `→ Sunucunun taglı üye oranı: %${procentTaggedMembers}`,
                                `→ Kullanıcı: ${m.user.tag} (${m.user.id})`,
                                `→ Tarih: ${client.functions.date(Date.now())}`,
                            ].join('\n')),
                        ].join('\n'),
                    })]
                }).catch(() => null);
            });

            if ([...settings.bannedTags].length && settings.bannedTagRole) bannedTaggedMembers.forEach(async (m) => {
                m.setNickname(m.displayName.replace(settings.secondTag, '[YASAKLI-TAG]').replace(vante.tags[0], '[YASAKLI-TAG]')).catch(() => null);
                client.await(2000).then(() => m.roles.add(settings.bannedTagRole).catch(() => null));

                const tag = settings.bannedTags.find((tag) => m.user.displayName.includes(tag));
                await client.getChannel('yasaklı-tag-log', guild)?.send({
                    flags: [4096],
                    embeds: [new EmbedBuilder({
                        color: client.getColor('red'),
                        title: 'Yasaklı Taglı Üye Tespit Edildi',
                        description: [
                            `${m} adlı üye yasaklı taglı (${inlineCode(tag)}) olduğu için rolleri geri alındı.`,
                            codeBlock('yaml', [
                                `# Bilgilendirme`,
                                `→ Kullanıcı: ${m.user.tag} (${m.user.id})`,
                                `→ Tarih: ${client.functions.date(Date.now())}`,
                            ].join('\n')),
                        ].join('\n'),
                    })]
                }).catch(() => null);
            });
        }

        async function checkPunishs(type) {
            const punitiveTypes = {
                ChatMute: settings.chatMuteRole,
                VoiceMute: settings.voiceMuteRole,
                Quarantine: settings.quarantineRole,
                Ads: settings.adsRole,
                Event: settings.eventPenaltyRole,
                Streamer: settings.streamPenaltyRole
            };
        
            if (!punitiveTypes[type]) return;
            
            const document = await PunitiveModel.find({ active: true, type });
            if (!document || document.length === 0) return;
        
            await Promise.all(document.map(async (data) => {
                const member = guild.members.cache.get(data.user);
                const role = punitiveTypes[type];
        
                if (!member && data.finishedTime && Date.now() >= data.finishedTime) {
                    await PunitiveModel.updateOne({ id: data.id }, { $set: { active: false } });
                    return;
                }
        
                if (member) {
                    if (data.finishedTime && Date.now() >= data.finishedTime) {
                        if (type === 'VoiceMute' && member.voice.channel) {
                            await member.voice.setMute(false).catch(() => {});
                        }
                        if (type === 'Quarantine' || type === 'Ads') {
                            await member.setRoles(data.roles).catch(() => {});
                        } else {
                            await member.roles.remove(role).catch(() => {});
                        }   
                        await PunitiveModel.updateOne({ id: data.id }, { $set: { active: false } });
                    } else {
                        if (type === 'VoiceMute' && member.voice.channel) {
                            await member.voice.setMute(true).catch(() => {});
                        }
                        if (type === 'Quarantine' || type === 'Ads') {
                            await member.setRoles(role).catch(() => {});
                        } else {
                            await member.roles.add(role).catch(() => {});
                        }
                    }
                }
            }));
        }

        setInterval(async () => {
            await checkPunishs('ChatMute');
            await checkPunishs('VoiceMute');
            await checkPunishs('Quarantine');
            await checkPunishs('Ads');
            await checkPunishs('Event');
            await checkPunishs('Streamer');
        }, 60000);

        setInterval(() => {
            checkUnregisters()
        }, 20000)

        setInterval(() => {
            if (systems.public) checkTaggeds()
        }, 20000)

        setInterval(() => {
            if (systems.public) checkUnTaggeds()
        }, 20000)
    }
};