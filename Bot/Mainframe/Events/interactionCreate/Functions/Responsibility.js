const { ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = async function Responsibility(client, interaction, route, ertu) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member) return;

    if (!isNaN(Number(route))) {
        const { currentRank } = client.staff.getRank(member, ertu);
        if (!currentRank) return interaction.reply({ content: `${await client.getEmoji('mark')} Bu komutu kullanabilmek için yetkili olmalısınız.`, ephemeral: true });

        let maximumSelect = 0;

        if (currentRank?.type === 'sub') maximumSelect = 2
        if (currentRank?.type === 'middle') maximumSelect = 3
        if (currentRank?.type === 'top') maximumSelect = 3

        const currentStaffResponsibilityRoles = member.roles.cache.filter(role =>
            ertu.settings.staffResponsibilities.includes(role.id)
        );

        if (currentStaffResponsibilityRoles.size >= maximumSelect) {
            return interaction.reply({
                content: `${await client.getEmoji('mark')} Lütfen en fazla ${maximumSelect} adet sorumluluk seçebilirsiniz.`,
                ephemeral: true
            });
        };

        const role = interaction.values.map((v) => interaction.guild?.roles.cache.get(v));
        if (member.roles.cache.has(role[0]?.id)) return interaction.reply({ content: `${await client.getEmoji('mark')} Zaten bu sorumluluğa sahipsiniz.`, ephemeral: true });
        const roleName = role[0]?.name.split(' ')[0];

        const controller = interaction.guild.roles.cache.find(r => r.name.includes(`${roleName} Denetleyici`));
        const leader = interaction.guild.roles.cache.find(r => r.name.includes(`${roleName} Lideri`));

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    custom_id: 'responsibility:approve',
                    label: 'Onayla',
                    style: ButtonStyle.Success,
                }),

                new ButtonBuilder({
                    custom_id: 'responsibility:reject',
                    label: 'Reddet',
                    style: ButtonStyle.Danger,
                })
            ]
        });

        const logChannel = await client.getChannel('sorumluluk-log', interaction)
        if (logChannel) logChannel.send({
            content: `${controller || ''} ${leader || ''}`,
            components: [row],
            flags: [4096],
            embeds: [
                new EmbedBuilder({
                    color: client.getColor('random'),
                    title: `${interaction.values.map((v) => interaction.guild?.roles.cache.get(v)?.name)} Sorumluluk Başvurusu`,
                    description: [
                        codeBlock('yaml', [
                            `→ Kullanıcı: ${member?.user.username} (${member?.user.id})`,
                            `→ Mevcut Yetki: ${interaction.guild?.roles.cache.get(currentRank?.role || '1337')?.name || 'Bulunamadı'}`,
                            `→ Sunucuya Katılım: ${client.functions.date(member?.joinedTimestamp || 0)}`,
                            `→ Tarih: ${client.functions.date(Date.now())}`,
                        ].join('\n')),

                        codeBlock('yaml', [
                            `# Seçilen Sorumluluk:`,
                            interaction.values.map((v) => `→ ${interaction.guild?.roles.cache.get(v)?.name}`).join('\n'),
                        ].join('\n')),
                    ].join('\n'),
                })
            ]
        });

        return interaction.reply({
            content: `${await client.getEmoji('check')} Sorumluluk başvurunuz alınmıştır. Yetkililer tarafından incelenecektir.`,
            ephemeral: true
        });
    }

    if (route === 'approve') {
        const admin = interaction.guild?.members.cache.get(interaction.user.id)
        if (!admin?.permissions.has(PermissionsBitField.Flags.Administrator) && !admin.roles.cache.has(controller?.id) && !admin.roles.cache.has(leader?.id)) return interaction.deferUpdate().catch(() => { });

        const roleTitle = interaction.message.embeds[0].title;
        const roleName = roleTitle.replace(' Sorumluluk Başvurusu', '');

        const role = interaction.guild?.roles.cache.find(r => r.name === roleName);

        await member.roles.add(role).catch(() => { });

        interaction.update({
            content: `${await client.getEmoji('check')} ${member} adlı yetkilinin sorumluluk başvurusu ${admin} tarafından onaylandı.`,
            components: [],
        });

        await member?.send({
            content: `${await client.getEmoji('check')} Sorumluluk başvurunuz ${admin} tarafından onaylandı. Sizle iletişime geçicektir.`,
        }).catch(() => { });
    }

    if (route === 'reject') {
        const admin = interaction.guild?.members.cache.get(interaction.user.id)
        if (!admin?.permissions.has(PermissionsBitField.Flags.Administrator) && !admin.roles.cache.has(controller?.id) && !admin.roles.cache.has(leader?.id)) return interaction.deferUpdate().catch(() => { });

        interaction.update({
            content: `${await client.getEmoji('check')} ${member} adlı yetkilinin sorumluluk başvurusu ${admin} tarafından reddedildi.`,
            components: [],
        });

        await member?.send({
            content: `${await client.getEmoji('check')} Sorumluluk başvurunuz ${admin} tarafından reddedildi.`,
        }).catch(() => { });
    }
}