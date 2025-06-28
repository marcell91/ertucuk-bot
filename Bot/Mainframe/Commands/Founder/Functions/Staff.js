const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, RoleSelectMenuBuilder, roleMention, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
const { SettingsModel } = require('../../../../../Global/Settings/Schemas')
const ms = require('ms');

module.exports = async function Role(client, message, option, ertu, question, author, menu = 'main', functionType) {
    await question.edit({
        content: option.description,
        components: createRow(client, message.guild, ertu?.staffRanks || []),
    });

    const filter = (i) => i.user.id === author;
    const collector = question.createMessageComponentCollector({
        filter,
        time: 1000 * 60 * 10,
    });

    collector.on('collect', async (i) => {
        if (i.isButton() && i.customId === 'back') {
            i.deferUpdate();
            collector.stop('FINISH');
            functionType(client, message, question, menu);
            return;
        };

        if (i.isRoleSelectMenu()) {
            if (i.customId === 'roleAdd') {
                const rankRoleId = i.values[0];

                if (ertu.staffRanks?.some((r) => r.role === rankRoleId)) {
                    return i.reply({
                        content: `${await client.getEmoji('mark')} Bu rol zaten ekli!`,
                        ephemeral: true
                    });
                };

                const hammersSelect = new ActionRowBuilder({
                    components: [
                        new RoleSelectMenuBuilder({
                            custom_id: 'hammerAdd',
                            placeholder: 'Ekstra rolleri (Ceo, Co-Ceo vb.)'
                        })
                    ]
                });

                const skipButton = new ActionRowBuilder({
                    components: [
                        new ButtonBuilder({
                            custom_id: 'skip',
                            label: 'Geç',
                            style: ButtonStyle.Danger,
                        }),
                    ],
                })

                i.reply({
                    components: [hammersSelect, skipButton],
                    ephemeral: true
                });

                const interactionMessage = await i.fetchReply();
                const extraCollected = await interactionMessage.awaitMessageComponent({
                    time: 1000 * 60 * 10,
                }).catch(() => null);

                if (extraCollected) {
                    const hammers = extraCollected.isAnySelectMenu() ? extraCollected.values : [];

                    const typeSelect = new ActionRowBuilder({
                        components: [
                            new StringSelectMenuBuilder({
                                custom_id: 'type',
                                placeholder: 'Yetki tipi seç..',
                                max_values: 1,
                                min_values: 1,
                                options: [
                                    { label: 'Alt Yetki', value: 'sub' },
                                    { label: 'Orta Yetki', value: 'middle' },
                                    { label: 'Üst Yetki', value: 'top' },
                                ]
                            })
                        ]
                    });

                    await extraCollected.update({
                        content: 'Yetki tipini seç..',
                        components: [typeSelect],
                    });

                    const typeCollectedMessage = await extraCollected.fetchReply();
                    const typeCollected = await typeCollectedMessage.awaitMessageComponent({
                        time: 1000 * 60 * 10,
                    }).catch(() => null);

                    if (typeCollected && typeCollected.isStringSelectMenu()) {
                        const type = typeCollected.values[0];

                        if (type === 'sub') {
                            const modal = new ModalBuilder({
                                custom_id: 'rankSettings',
                                title: 'Yetki Ayarları',
                                components: [
                                    new ActionRowBuilder({
                                        components: [
                                            new TextInputBuilder({
                                                custom_id: 'point',
                                                label: 'Puan',
                                                placeholder: '1000',
                                                required: true,
                                                style: TextInputStyle.Short
                                            })
                                        ]
                                    }),
                                ]
                            });

                            await typeCollected.showModal(modal)
                            const modalCollected = await typeCollected.awaitModalSubmit({ time: 90000 });

                            if (modalCollected) {
                                const point = Number(modalCollected.fields.getTextInputValue('point'));

                                if (isNaN(point)) {
                                    return i.editReply({
                                        components: [],
                                        content: `${client.getEmoji('mark')} puan sayi olmak zorunda!`
                                    })
                                };

                                const newRank = [
                                    ...(ertu.staffRanks || []),
                                    {
                                        place: ertu.staffRanks.length + 1,
                                        type: type,
                                        role: rankRoleId,
                                        hammers: hammers,
                                        point: point,
                                    },
                                ];

                                await SettingsModel.updateOne({ id: ertu.id }, { staffRanks: newRank });
                                await modalCollected.deferUpdate();
                            } else i.deleteReply().catch(() => undefined);
                        } else {
                            const modal = new ModalBuilder({
                                custom_id: 'settings',
                                title: 'Görev Ayarları',
                                components: [
                                    new ActionRowBuilder({
                                        components: [
                                            new TextInputBuilder({
                                                custom_id: 'day',
                                                label: 'Yetki Süresi',
                                                placeholder: '7',
                                                required: true,
                                                style: TextInputStyle.Short,
                                            })
                                        ]
                                    }),
                                    new ActionRowBuilder({
                                        components: [
                                            new TextInputBuilder({
                                                custom_id: 'public',
                                                label: 'Public Ses',
                                                placeholder: '10h',
                                                required: false,
                                                style: TextInputStyle.Short,
                                            })
                                        ]
                                    }),
                                    new ActionRowBuilder({
                                        components: [
                                            new TextInputBuilder({
                                                custom_id: 'streamer',
                                                label: 'Streamer Ses',
                                                placeholder: '10h',
                                                required: false,
                                                style: TextInputStyle.Short,
                                            })
                                        ]
                                    }),
                                    new ActionRowBuilder({
                                        components: [
                                            new TextInputBuilder({
                                                custom_id: 'afk',
                                                label: 'Afk Ses',
                                                placeholder: '10h',
                                                required: false,
                                                style: TextInputStyle.Short,
                                            })
                                        ]
                                    })
                                ]
                            });

                            await typeCollected.showModal(modal)
                            const modalCollected = await typeCollected.awaitModalSubmit({ time: 90000 }).catch(() => null);
                            if (modalCollected && modalCollected.isModalSubmit()) {
                                const day = Number(modalCollected.fields.getTextInputValue('day'));
                                const public = modalCollected.fields.getTextInputValue('public');
                                const streamer = modalCollected.fields.getTextInputValue('streamer');
                                const afk = modalCollected.fields.getTextInputValue('afk');

                                const embed = {
                                    description: [
                                        `> Yetki Süresi: ${day} gün`,
                                        `> Public Ses: ${public}`,
                                        `> Streamer Ses: ${streamer ? streamer : 'Ayarlanmamış'}`,
                                        `> AFK Ses: ${afk ? afk : 'Ayarlanmamış'}`,
                                    ].join('\n'),
                                    color: client.getColor()
                                };

                                const row = new ActionRowBuilder({
                                    components: [
                                        new ButtonBuilder({
                                            custom_id: 'continue',
                                            label: 'Devam Et',
                                            style: ButtonStyle.Success
                                        }),
                                        new ButtonBuilder({
                                            custom_id: 'cancel',
                                            label: 'İptal',
                                            style: ButtonStyle.Danger
                                        })
                                    ]
                                });

                                const reply = await modalCollected.reply({
                                    embeds: [embed],
                                    components: [row],
                                    ephemeral: true,
                                    fetchReply: true
                                });

                                const buttonCollector = reply.createMessageComponentCollector({
                                    filter: i => i.user.id === author,
                                    time: 30000
                                });

                                buttonCollector.on('collect', async (button) => {
                                    if (button.customId === 'cancel') {
                                        button.update({
                                            content: `${await client.getEmoji('mark')} İşlem iptal edildi!`,
                                            embeds: [],
                                            components: []
                                        });
                                        return;
                                    }

                                    if (button.customId === 'continue') {
                                        const secondModal = new ModalBuilder({
                                            custom_id: 'requirements',
                                            title: 'Görev Gereksinimleri',
                                            components: [
                                                new ActionRowBuilder({
                                                    components: [
                                                        new TextInputBuilder({
                                                            custom_id: 'message',
                                                            label: 'Mesaj',
                                                            placeholder: '100',
                                                            required: false,
                                                            style: TextInputStyle.Short,
                                                        })
                                                    ]
                                                }),
                                                new ActionRowBuilder({
                                                    components: [
                                                        new TextInputBuilder({
                                                            custom_id: 'authority',
                                                            label: 'Yetkili',
                                                            placeholder: '3',
                                                            required: false,
                                                            style: TextInputStyle.Short,
                                                        })
                                                    ]
                                                }),
                                                new ActionRowBuilder({
                                                    components: [
                                                        new TextInputBuilder({
                                                            custom_id: 'tagged',
                                                            label: 'Taglı',
                                                            placeholder: '5',
                                                            required: false,
                                                            style: TextInputStyle.Short,
                                                        })
                                                    ]
                                                }),
                                                new ActionRowBuilder({
                                                    components: [
                                                        new TextInputBuilder({
                                                            custom_id: 'register',
                                                            label: 'Teyit',
                                                            placeholder: '20',
                                                            required: false,
                                                            style: TextInputStyle.Short,
                                                        })
                                                    ]
                                                })
                                            ]
                                        });

                                        await button.showModal(secondModal);

                                        const secondModalCollected = await button.awaitModalSubmit({ time: 90000 }).catch(() => null);

                                        if (secondModalCollected && secondModalCollected.isModalSubmit()) {
                                            const message = Number(secondModalCollected.fields.getTextInputValue('message'));
                                            const authority = Number(secondModalCollected.fields.getTextInputValue('authority'));
                                            const tagged = Number(secondModalCollected.fields.getTextInputValue('tagged'));
                                            const register = Number(secondModalCollected.fields.getTextInputValue('register'));

                                            if (isNaN(message) || isNaN(authority) || isNaN(tagged) || isNaN(register)) {
                                                return secondModalCollected.reply({
                                                    content: `${await client.getEmoji('mark')} Gereksinimler sadece sayı olabilir!`,
                                                    ephemeral: true
                                                });
                                            }

                                            const requiredTasks = [];

                                            if (message) {
                                                requiredTasks.push({
                                                    TYPE: 'MESSAGE',
                                                    NAME: `Mesaj`,
                                                    COUNT: parseInt(message),
                                                    COUNT_TYPE: 'DEFAULT',
                                                });
                                            }

                                            if (authority) {
                                                requiredTasks.push({
                                                    TYPE: 'STAFF',
                                                    NAME: `Yetkili Çekme`,
                                                    COUNT: parseInt(authority),
                                                    COUNT_TYPE: 'DEFAULT',
                                                });
                                            }

                                            if (register) {
                                                requiredTasks.push({
                                                    TYPE: 'REGISTER',
                                                    NAME: `Teyit`,
                                                    COUNT: parseInt(register),
                                                    COUNT_TYPE: 'DEFAULT',
                                                });
                                            }

                                            if (public) {
                                                requiredTasks.push({
                                                    TYPE: 'PUBLIC',
                                                    NAME: `Public Ses`,
                                                    COUNT: ms(public),
                                                    COUNT_TYPE: 'TIME',
                                                });
                                            }

                                            if (streamer) {
                                                requiredTasks.push({
                                                    TYPE: 'STREAMER',
                                                    NAME: `Streamer Ses`,
                                                    COUNT: ms(streamer),
                                                    COUNT_TYPE: 'TIME',
                                                });
                                            }

                                            if (afk) {
                                                requiredTasks.push({
                                                    TYPE: 'AFK',
                                                    NAME: `Afk Ses`,
                                                    COUNT: ms(afk),
                                                    COUNT_TYPE: 'TIME',
                                                });
                                            }

                                            const newRank = [
                                                ...(ertu.staffRanks || []),
                                                {
                                                    place: ertu.staffRanks.length + 1,
                                                    day: day,
                                                    type: type,
                                                    role: rankRoleId,
                                                    hammers: hammers,
                                                    tasks: [
                                                        ...requiredTasks,
                                                    ],
                                                },
                                            ];

                                            await SettingsModel.updateOne({ id: ertu.id }, { staffRanks: newRank });
                                            await secondModalCollected.deferUpdate();
                                        }
                                    }
                                })
                            }
                        }
                    }

                    i.editReply({
                        content: `${await client.getEmoji('check')} Başarıyla ${roleMention(rankRoleId)} yetkisi eklendi!`,
                        components: [],
                        ephemeral: true
                    });

                    question.edit({
                        content: option.description,
                        components: createRow(client, message.guild, ertu.staffRanks)
                    });
                };
            };
        };

        if (i.isStringSelectMenu()) {
            await i.deferReply({ ephemeral: true });
            const newData = (ertu.staffRanks || []);
            ertu.staffRanks = newData.filter((d) => !i.values.includes(d.role));

            i.message.edit({
                content: option.description,
                components: createRow(client, message.guild, ertu.staffRanks)
            });

            i.editReply({
                content: `${await client.getEmoji('check')} başarıyla yetki kaldırıldı!`,
                components: [],
            });

            await message.guild?.updateSettings({ staffRanks: ertu.staffRanks });
        };
    });
}

function createRow(client, guild, data) {
    const ranks = data?.filter((r) => guild.roles.cache.has(r.role)).map((r) => r).sort((a, b) => b.place - a.place) || [];
    const chunks = client.functions.chunkArray(ranks, 25);

    const rows = [];
    let page = 0;

    for (const chunk of chunks) {
        page++;

        if (page === 3) break;
        rows.push(
            new ActionRowBuilder({
                components: [
                    new StringSelectMenuBuilder({
                        customId: 'ranks:' + page,
                        placeholder: `Ranklar (Sayfa ` + page + `)`,
                        options: chunk.map((r) => {
                            const role = guild.roles.cache.get(r.role);
                            return {
                                label: `${role?.name} - ${r.type === 'sub' ? `${r.point}` : 'Görev Sistemi' }`,
                                value: role?.id,
                            };
                        })
                    })
                ]
            })
        )
    };

    rows.push(
        new ActionRowBuilder({
            components: [
                new RoleSelectMenuBuilder({
                    custom_id: 'roleAdd',
                    placeholder: 'Yetki rank ekle',
                    max_values: 1,
                })
            ]
        })
    )

    rows.push(
        new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'back',
                    label: 'Geri',
                    style: ButtonStyle.Danger
                }),
            ],
        })
    )

    return rows;
}