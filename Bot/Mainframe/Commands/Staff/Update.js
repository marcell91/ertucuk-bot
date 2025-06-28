const { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, PermissionFlagsBits, roleMention, StringSelectMenuBuilder, inlineCode } = require('discord.js')
const { StaffModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'yetkili',
    Aliases: ['yetki', 'yt'],
    Description: 'Kullanıcıya yetkili rolü verir.',
    Usage: 'yetkili <@User/ID>',
    Category: 'Staff',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send({ content: `Kullanıcı bulunamadı!` });
        if (member.user.bot) return message.channel.send({ content: `Botların verisi bulunamaz!` });
        if (member.id === message.author.id) return message.channel.send({ content: `Kendine yetki veremezsin!` });
        if (client.functions.checkUser(message, member)) return;

        if (ertu.systems.public) {
            if (!member.user.displayName.includes(ertu.settings.tag)) {
                message.channel.send({ content: `${await client.getEmoji('mark')} Belirttiğin kullanıcı tagımızı almadığı için yetki verilemez!` });
                return;
            }
        }

        if (!client.staff.check(member, ertu)) {

            const document = await StaffModel.findOne({ user: member.id }) || { oldRanks: [] };
            if (document?.authBlock === true) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder({
                            author: { name: message.guild.name, icon_url: message.guild.iconURL() },
                            description: [
                                `${await client.getEmoji('mark')} ${member} adlı kullanıcıya yetki verilemez!`,
                                '',
                                `${await client.getEmoji('point')} İşlem Zamanı: ${client.timestamp(document.authBlockDate)}`,
                                `${await client.getEmoji('point')} İşlem Sebebi: ${document.authBlockReason}`,
                                `${await client.getEmoji('point')} İşlemi Yapan: ${message.guild.members.cache.get(document.authBlockStaff)} (${document.authBlockStaff})`,
                                `${await client.getEmoji('point')} Durum: ${document.authBlock ? `${inlineCode(' Cezası Devam Etmektedir. ')}` : `${inlineCode(' Cezası Yoktur. ')}`}`,
                            ].join('\n')
                        })
                    ]
                })
            }

            const row = new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        custom_id: 'accept',
                        label: 'Kabul Ediyorum',
                        style: ButtonStyle.Secondary,
                    }),
                    new ButtonBuilder({
                        custom_id: 'deaccept',
                        label: 'Reddediyorum',
                        style: ButtonStyle.Secondary,
                    }),
                ],
            });

            const mappedData = document.oldRanks.map((r) => {
                const role = r.roles.find(role => ertu.staffRanks.some((rr) => rr.role === role));
                const date = client.timestamp(r.date);

                return `[${date}]: ${role && message.guild?.roles.cache.has(role) ? message.guild.roles.cache.get(role) : '[@bulunamadı](https://ertu.live)'}`;
            });

            const question = await message.channel.send({
                content: `${member}, ${message.author} adlı yetkilimiz seni yetkiye davet etti!`,
                components: [row],
                embeds: mappedData.length ? [
                    new EmbedBuilder({
                        color: client.getColor('random'),
                        author: { name: message.author.tag, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) },
                        description: [
                            `- ${bold('GEÇMİŞ YETKİ DURUMU')}`,
                            mappedData.join('\n'),
                        ].join('\n'),
                    })
                ] : [],
            });

            const filter = (i) => i.user.id === member.id && ['accept', 'deaccept'].includes(i.customId);
            const collector = question.createMessageComponentCollector({
                filter,
                time: 1000 * 60 * 5,
                componentType: ComponentType.Button,
            });

            collector.on('collect', async (i) => {
                i.deferUpdate();

                if (i.customId === 'accept') {
                    collector.stop('ACCEPT');

                    question.edit({
                        content: `${await client.getEmoji('check')} ${member} yetkili olarak kabul edildi!`,
                        components: [],
                        embeds: [],
                    });

                    const now = Date.now();

                    const sortedRanks = ertu.staffRanks.filter(x => x.type === 'sub').sort((a, b) => a.point - b.point);
                    const sortedRoles = [sortedRanks[0].role, ...sortedRanks[0].hammers];

                    await member.roles.add(sortedRoles, `${message.author.username} tarafından yetki verildi!`);

                    const newRank = {
                        roles: sortedRoles,
                        date: now,
                        staff: message.author.id,
                        reason: 'Yetki verildi!',
                        up: true,
                    };

                    await StaffModel.updateOne(
                        { user: member.id },
                        {
                            $setOnInsert: { user: member.id },
                            $push: {
                                oldRanks: {
                                    $each: [newRank],
                                    $position: 0,
                                },
                            },
                        },
                        { upsert: true }
                    );

                    const orientationLog = await client.getChannel('oryantasyon-log', message);

                    const staffLog = await client.getChannel('yetki-başlayan', message);
                    const staffButton = new ActionRowBuilder({
                        components: [
                            new ButtonBuilder({
                                custom_id: 'staff:' + member.id,
                                label: 'Yetkili ile ilgilen',
                                style: ButtonStyle.Primary,
                            }),
                        ],
                    });

                    const orientationRoles = message.guild.roles.cache.filter(role => role.name.toLowerCase().includes('oryantasyon'));

                    if (orientationLog) {
                        orientationLog.send({
                            content: orientationRoles ? orientationRoles.map(r => roleMention(r.id)).join(' ') : '',
                            components: [staffButton],
                            embeds: [
                                new EmbedBuilder({
                                    color: client.getColor('random'),
                                    description: [
                                        `${member} adlı kullanıcıya ${message.author} tarafından yetki verildi!`,
                                        ' ',
                                        `→ Yetki veren: ${message.author}`,
                                        `→ Yetki verme tarihi: ${client.timestamp(now)}`,
                                        `→ Hesap oluşturma tarihi: ${client.timestamp(member.user.createdTimestamp)}`,
                                        `→ Sunucuya katılma tarihi: ${client.timestamp(member.joinedTimestamp)}`,
                                    ].join('\n'),
                                })
                            ],
                        });
                    };

                    if (staffLog) {
                        staffLog.send({
                            embeds: [
                                new EmbedBuilder({
                                    color: client.getColor('random'),
                                    description: [
                                        `${member} adlı kullanıcıya ${message.author} tarafından yetki verildi!`,
                                        ' ',
                                        `→ Yetki veren: ${message.author}`,
                                        `→ Yetki verme tarihi: ${client.timestamp(now)}`,
                                        `→ Verilen Yetkiler: ${roleMention(sortedRanks[0].role)} ${roleMention(sortedRanks[0].hammers)}`,
                                        `→ Hesap oluşturma tarihi: ${client.timestamp(member.user.createdTimestamp)}`,
                                        `→ Sunucuya katılma tarihi: ${client.timestamp(member.joinedTimestamp)}`,
                                    ].join('\n'),
                                })
                            ],
                        });
                    };

                    if (!client.staff.check(message.member, ertu)) return;

                    await client.staff.checkRank(client, message.member, ertu, { type: 'staffPoints', amount: 1, user: member.id, point: 50 });
                } else {
                    collector.stop('DEACCEPT');
                    question.edit({
                        content: `${await client.getEmoji('mark')} ${member} yetkili olarak reddedildi!`,
                        components: [],
                        embeds: [],
                    });
                }
            });

            collector.on('end', async (_, r) => {
                if (r === 'time') {
                    question.edit({
                        content: `${await client.getEmoji('mark')} İşlem süresi doldu!`,
                        components: [],
                        embeds: [],
                    });
                }
            });
        } else if (ertu.settings?.staffUpdateAuth.some(r => message.member?.roles.cache.has(r)) || message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const document = await StaffModel.findOne({ user: member.id }) || { oldRanks: [] };
            const { currentRank } = client.staff.getRank(member, ertu);

            const subOptions = ertu.staffRanks
                .filter(r => message.guild?.roles.cache.has(r.role) && r.type === 'sub')
                .sort((a, b) => b.point - a.point)
                .map(r => ({
                    value: r.role,
                    label: message.guild?.roles.cache.get(r.role)?.name,
                    description: `Puan: ${r.point}`,
                }));
            if (subOptions.length === 0) {
                return message.channel.send({ content: 'Alt yetki seçeneği bulunamadı!' });
            }
            const subRow = new ActionRowBuilder({
                components: [
                    new StringSelectMenuBuilder({
                        custom_id: 'sub-selection',
                        placeholder: 'Alt Yetkiler',
                        options: subOptions.slice(0, 25),
                    })
                ],
            });

            const middleOptions = ertu.staffRanks
                .filter(r => message.guild?.roles.cache.has(r.role) && r.type === 'middle')
                .sort((a, b) => b.place - a.place)
                .map(r => ({
                    value: r.role,
                    label: message.guild?.roles.cache.get(r.role)?.name,
                    description: r.hammers ? r.hammers.map(h => message.guild?.roles.cache.get(h)?.name).join(', ') : 'Ekstra rol yok!',
                }));
            const middleRow = middleOptions.length > 0 ? new ActionRowBuilder({
                components: [
                    new StringSelectMenuBuilder({
                        custom_id: 'middle-selection',
                        placeholder: 'Orta Yetkiler',
                        options: middleOptions.slice(0, 25),
                    })
                ],
            }) : null;

            const topOptions = ertu.staffRanks
                .filter(r => message.guild?.roles.cache.has(r.role) && r.type === 'top')
                .sort((a, b) => b.place - a.place)
                .map(r => ({
                    value: r.role,
                    label: message.guild?.roles.cache.get(r.role)?.name,
                    description: r.hammers ? r.hammers.map(h => message.guild?.roles.cache.get(h)?.name).join(', ') : 'Ekstra rol yok!',
                }));
            const topRow = topOptions.length > 0 ? new ActionRowBuilder({
                components: [
                    new StringSelectMenuBuilder({
                        custom_id: 'top-selection',
                        placeholder: 'Üst Yetkiler',
                        options: topOptions.slice(0, 25),
                    })
                ],
            }) : null;

            const rows = [subRow];
            if (middleRow) rows.push(middleRow);
            if (topRow) rows.push(topRow);

            const mappedData = document.oldRanks.map((r) => {
                const role = r.roles.find(role => ertu.staffRanks.some((rr) => rr.role === role));
                const date = client.timestamp(r.date);

                return `[${date}]: ${role && message.guild?.roles.cache.has(role) ? message.guild.roles.cache.get(role) : '[@bulunamadı](https://ertu.live)'}`;
            });

            const question = await message.channel.send({
                components: rows,
                embeds: mappedData.length ? [
                    new EmbedBuilder({
                        color: client.getColor('random'),
                        author: { name: message.author.tag, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) },
                        description: [
                            `${bold('GEÇMİŞ YETKİ DURUMU')}`,
                            mappedData.join('\n'),
                        ].join('\n'),
                    })
                ] : [],
            });

            const filter = (i) => i.user.id === message.author.id;
            const collector = question.createMessageComponentCollector({
                filter,
                time: 1000 * 60 * 5,
            });

            collector.on('collect', async (i) => {
                const newRank = ertu.staffRanks.find((r) => r.role === i.values[0]);
                if (currentRank?.role === newRank?.role) return i.reply({ content: `${await client.getEmoji('mark')} Belirttiğin kullanıcı zaten bu role sahip!`, ephemeral: true });

                i.deferUpdate();

                question.edit({
                    content: null,
                    components: [],
                    embeds: [
                        embed.setDescription(`${member} adlı kullanıcının yetkisi ${roleMention(currentRank?.role)} rolünden ${roleMention(newRank?.role)} rolüne geçirildi.`),
                    ],
                });

                const now = Date.now();
                const newData = {
                    roles: [newRank?.role, ...newRank?.hammers],
                    date: now,
                    staff: message.author.id,
                    reason: 'Yetki güncellendi!',
                    up: true,
                };

                await StaffModel.updateOne(
                    { user: member.id },
                    {
                        $push: {
                            oldRanks: newData,
                        },
                        $set: {
                            roleStartAt: now,
                            taskStartAt: 0,

                            inviteds: [],
                            tasks: [],
                            staffs: [],
                            bonuses: [],

                            totalGeneralMeeting: 0,
                            totalIndividualMeeting: 0,
                            totalStaffMeeting: 0,
                            ticks: 0,
                            taskName: '',

                            dailyPoints: 0,
                            bonusPoints: 0,
                            totalPoints: 0,
                            registerPoints: 0,
                            publicPoints: 0,
                            afkPoints: 0,
                            streamerPoints: 0,
                            activityPoints: 0,
                            messagePoints: 0,
                            invitePoints: 0,
                            staffPoints: 0,
                            taggedPoints: 0,
                        },
                    },
                    { upsert: true }
                );

                await member.roles.remove([currentRank?.role, ...currentRank?.hammers], `${message.author.username} tarafından yetki güncellendi!`);
                await member.roles.add([newRank?.role, ...newRank?.hammers], `${message.author.username} tarafından yetki güncellendi!`);

                const logChannel = await client.getChannel('yetki-yükseltimleri', message)

                if (logChannel) logChannel.send({
                    embeds: [
                        new EmbedBuilder({
                            color: client.getColor('random'),
                            description: [
                                `${member} üyesinin yetkisi ${message.author} tarafından güncellendi!`,
                                ' ',
                                `→ Yetki veren: ${message.author}`,
                                `→ Yetki verme tarihi: ${client.timestamp(now)}`,
                                `→ Hesap oluşturma tarihi: ${client.timestamp(member.user.createdTimestamp)}`,
                                `→ Sunucuya katılma tarihi: ${client.timestamp(member.joinedTimestamp)}`,
                            ].join('\n'),
                        })
                    ],
                });
            });
        }
    },
};