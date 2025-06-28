const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, inlineCode, time, userMention } = require('discord.js')
const { StaffModel } = require('../../../../Global/Settings/Schemas')

module.exports = {
    Name: 'toplantı',
    Aliases: ['meeting'],
    Description: 'Sunucu toplantılarını düzenler.',
    Usage: 'toplantı',
    Category: 'Founder',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {
        if (!message.guild?.roles.cache.has(ertu.settings.meetingRole)) {
            client.embed(message, 'Rol ayarlanmamış');
            return;
        }

        if (!message.member?.voice.channelId) {
            client.embed(message, 'Bir ses kanalına katılıp kullanman lazım!');
            return;
        }

        const buttonRow = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    custom_id: 'general',
                    label: 'Genel Toplantı',
                    style: ButtonStyle.Primary,
                }),
                new ButtonBuilder({
                    custom_id: 'personal',
                    label: 'Bireysel Toplantı',
                    style: ButtonStyle.Primary,
                }),
                new ButtonBuilder({
                    custom_id: 'role',
                    label: 'Rol Toplantısı',
                    style: ButtonStyle.Primary,
                }),
            ],
        });

        const question = await message.channel.send({
            content: 'Yapacağınız toplantı işlemi seçin.',
            components: [buttonRow],
        });

        const filter = (i) => i.user.id === message.author.id;
        const collected = await question.awaitMessageComponent({
            filter,
            componentType: ComponentType.Button,
        });

        if (collected) {
            const meetingLog = message.guild?.channels.cache.find((channel) => channel.name === 'meeting-log')
            const channel = message.member.voice.channel;
            const staffMembers = channel?.members.filter((m) => client.staff.check(m, ertu)).map((m) => m.id);

            if (collected.customId === 'general') {
                if (ertu.settings.meetingRole && message.guild?.roles.cache.has(ertu.settings.meetingRole)) {
                    message.guild.members.cache
                        .filter(
                            (member) =>
                                !channel?.members.has(member.id) && member.roles.cache.has(ertu.settings.meetingRole),
                        )
                        .forEach((member) => member.roles.remove(ertu.settings.meetingRole));
                    channel?.members
                        .filter((member) => !member.user.bot && !member.roles.cache.has(ertu.settings.meetingRole))
                        .forEach((member) => member.roles.add(ertu.settings.meetingRole));
                }

                question.edit({
                    embeds: [
                        new EmbedBuilder({
                            color: client.getColor('random'),
                            author: {
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL({ forceStatic: true, size: 4096 }),
                            },
                            description: `${channel} odasındaki üyelere toplantıya katıldı rolü verildi.`,
                        }),
                    ],
                    components: [],
                });

                if (meetingLog) {
                    const arr = client.functions.splitMessage(
                        [
                            `${time(Math.floor(Date.now() / 1000), 'D')} tarihinde yapılan toplantıya ${inlineCode(
                                channel?.members.size.toString(),
                            )} adet üye katıldı. Katılan üyeler;\n`,
                            channel?.members.map((member) => `${member} (${inlineCode(member.id)})`).join('\n'),
                        ].join('\n'),
                        { maxLength: 2000, char: ',' },
                    );
                    for (const newText of arr) meetingLog.send({ content: newText });
                }

                if (staffMembers?.length) {
                    await StaffModel.updateMany(
                        { user: { $in: staffMembers } },
                        {
                            $inc: {
                                totalGeneralMeeting: 1,
                                totalPoints: 120
                            }
                        }
                    );
                }
            } else if (collected.customId === 'personal') {
                if (!staffMembers?.length) {
                    question.edit({
                        content: 'Seste yetkili bulunmuyor.',
                        components: [],
                    });
                    return;
                }

                if (staffMembers.length > 3) {
                    question.edit({
                        content: 'Bireysel toplantı mı yapıyorsun yoksa genel toplantı mı?!',
                        components: [],
                    });
                    return;
                }

                question.edit({
                    content: `${userMention(staffMembers[0])} adlı kullanıcının bireysel toplantısı yapıldı.`,
                    components: [],
                });

                if (meetingLog) {
                    meetingLog.send({
                        content: `${time(Math.floor(Date.now() / 1000), 'D')} tarihinde ${userMention(
                            staffMembers[0],
                        )} (${inlineCode(staffMembers[0])}) adlı yetkiliyle ${message.author} (${inlineCode(
                            message.author.id,
                        )}) adlı yetkili bireysel toplantı yaptı.`,
                    });
                }

                await StaffModel.updateOne(
                    { user: staffMembers[0] },
                    {
                        $inc: {
                            totalIndividualMeeting: 1,
                            totalPoints: 120
                        }
                    }
                );
            } else {
                question.edit({
                    embeds: [
                        new EmbedBuilder({
                            color: client.getColor('random'),
                            author: {
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL({ forceStatic: true, size: 4096 }),
                            },
                            description: `${channel} odasındaki üyelere puanları verildi.`,
                        }),
                    ],
                    components: [],
                });

                if (meetingLog) {
                    const arr = client.functions.splitMessage(
                        [
                            `${time(
                                Math.floor(Date.now() / 1000),
                                'D',
                            )} tarihinde yapılan rol toplantısına ${inlineCode(
                                channel?.members.size.toString(),
                            )} adet üye katıldı. Katılan üyeler;\n`,
                            channel?.members.map((member) => `${member} (${inlineCode(member.id)})`).join('\n'),
                        ].join('\n'),
                        { maxLength: 2000, char: ',' },
                    );
                    for (const newText of arr) meetingLog.send({ content: newText });
                }

                if (staffMembers?.length) {
                    await StaffModel.updateMany(
                        { user: { $in: staffMembers } },
                        {
                            $inc: {
                                totalStaffMeeting: 1,
                                totalPoints: 120
                            }
                        }
                    );
                }
            }
        } else {
            question.edit({
                content: 'Zaman aşımına uğradı.',
                components: [],
            });
        }
    },
};