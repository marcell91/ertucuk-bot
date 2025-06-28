const { EmbedBuilder, codeBlock, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function Tag(client, oldUser, newUser, member, ertu) {
    const oldHasTag = ertu.settings.tag.split('').some((t) => oldUser.displayName.includes(t))
    const newHasTag = ertu.settings.tag.split('').some((t) => newUser.displayName.includes(t))
    const tagMemberCount = member.guild.members.cache.filter((m) => m.user.displayName.includes(ertu.settings.tag))

    const tagJoin = await client.getChannel('tag-alanlar', member)
    const tagLeave = await client.getChannel('tag-salanlar', member)
    const staffLeave = await client.getChannel('yetki-salanlar', member)
    if (!tagJoin || !tagLeave || !staffLeave) return;

    if (!oldHasTag && newHasTag) {
        member.roles.add(ertu.settings.familyRole)
        setTimeout(() => {
            member.setNickname(member.displayName.replace(ertu.settings.secondTag, ertu.settings.tag)).catch(() => { })
        }, 2000)

        return tagJoin.send({
            flags: [4096],
            embeds: [new EmbedBuilder({
                color: client.getColor('green'),
                title: 'Taglı Üye Tespit Edildi',
                description: `${member} adlı kullanıcı tagımızı alarak ailemize katıldı. Ailemiz şuanda ${tagMemberCount.size} kişiye ulaştı.`,
                fields: [
                    {
                        name: '\u200b',
                        value: codeBlock('yaml', [
                            `# Bilgilendirme`,
                            `→ Kullanıcı: ${member.user.username} (${member.user.id})`,
                            `→ Tarih: ${client.functions.date(Date.now())}`,
                        ].join('\n')),  
                    }
                ]
            })],
        }).catch(() => null);
    }

    if (oldHasTag && !newHasTag) {

        if (ertu.systems.taggedMode === true && !member.premiumSince) {
            member.setRoles(ertu.settings.unregisterRoles).catch(() => { })
            member.setNickname(`${ertu.settings.secondTag} ${ertu.settings.name}`).catch(() => { })
            member.send({ content: `Merhaba ${member}, tagımızı çıkardığın için otomatik olarak kayıtsıza atıldın. Eğer tekrar aramıza katılmak istersen, tagımızı alarak tekrar aramıza katılabilirsin. İyi günler dileriz.` }).catch(() => { })
        } else {
            member.roles.remove(ertu.settings.familyRole)
            setTimeout(() => {
                member.setNickname(member.displayName.replace(ertu.settings.tag, ertu.settings.secondTag)).catch(() => { })
            }, 2000)
            setTimeout(async() => {
                await member.removeStaffRoles()
            }, 5000)
        }

        tagLeave.send({
            flags: [4096],
            embeds: [new EmbedBuilder({
                color: client.getColor('red'),
                title: 'Tagsız Üye Tespit Edildi',
                description: `${member} adlı kullanıcı tagımızı çıkararak ailemizden ayrıldı. Ailemiz şuanda ${tagMemberCount.size} kişiye düştü.`,
                fields: [
                    {
                        name: '\u200b',
                        value: codeBlock('yaml', [
                            `# Bilgilendirme`,
                            `→ Kullanıcı: ${member.user.username} (${member.user.id})`,
                            `→ Tarih: ${client.functions.date(Date.now())}`,
                        ].join('\n')),
                    }
                ]
            })],
        }).catch(() => null);

        if (client.staff.check(member, ertu)) {
            console.log('sa')
            const lowestRole = member.guild.roles.cache.get(member.guild.find.settings.minStaffRole);
            if (!lowestRole || !member.manageable) return;

            const roles = member.roles.cache.filter((role) => role.position >= lowestRole.position)

            const roleName = roles.map((role) => role?.name || 'Bilinmeyen Rol').join(', ');
            const returnRoles = member.guild.roles.cache.filter((role) => role.name.includes('Return')).map(role => `<@&${role.id}>`).join(', ');

            const staffButton = new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        custom_id: 'staff:' + member.id,
                        label: 'İlgileniyorum',
                        style: ButtonStyle.Secondary,
                    }),
                ],
            });

            staffLeave.send({
                flags: [4096],
                components: [staffButton],
                content: returnRoles || null,
                embeds: [new EmbedBuilder({
                    color: client.getColor('red'),
                    title: 'Tagsız Yetkili Tespit Edildi',
                    description: `${member} adlı yetkili tagımızı çıkararak ailemizden ayrıldı.`,
                    fields: [
                        {
                            name: '\u200b',
                            value: [
                                `# Bilgilendirme`,
                                `→ Kullanıcı: ${member.user.username} (${member.user.id})`,
                                `→ Tarih: ${client.functions.date(Date.now())}`,
                                `→ Yetkiler: ${roleName}`,
                            ].join('\n'),
                        }
                    ]
                })],
            }).catch(() => null);
        }
    }
}