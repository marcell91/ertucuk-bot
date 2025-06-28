const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js')
const ms = require('ms')
const { StaffModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'mazaret',
    Aliases: [],
    Description: 'Yetkili için mazeret oluşturursun.',
    Usage: 'mazeret <@User/ID> <süre> <sebep>',
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

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) return message.channel.send({ content: `Kullanıcı bulunamadı!` });

        if (!client.staff.check(member, ertu)) return message.channel.send({ content: `${member.id === message.author.id ? 'Yetkili değilsiniz.' : 'Belirttiğin kullanıcı yetkili değil!'}` });

        const timing = member.id === message.author.id ? args[0] : args[1];

        const reason = member.id === message.author.id ? args.slice(1).join(' ') : args.slice(2).join(' ')

        const document = await StaffModel.findOne({ user: member.id })
        if (!document) return message.channel.send({ content: `${member.id === message.author.id ? 'Yetkili değilsiniz.' : 'Belirttiğin kullanıcı yetkili değil!'}` });

        if (!timing && !reason.length) {
            if (!document.excuses.length) return message.channel.send({ content: 'Silincek mazereti bulunamadı. ' })
            const row = new ActionRowBuilder({
                components: [
                    new StringSelectMenuBuilder({
                        custom_id: 'excuse_reason',
                        placeholder: 'Silmek istediğin mazereti seç',
                        disabled: document?.excuses.length ? false : true,
                        options: document?.excuses.length ? document.excuses.map((x) => ({ label: x.reason, description: `Yetkili ${message.guild?.members.cache.get(x.staff)?.user.username || 'Bulunamadı'}`, value: x.reason })) : [{ label: 'Yetkili Mazeretleri Bulunmamakta.', value: 'excuse_not_found' }],
                    }),
                ],
            });

            const question = await message.channel.send({
                components: [row],
            });

            if (!document?.excuses.length) return;

            const collector = question.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: m => m.user.id === message.author.id });

            collector.on('collect', async (i) => {
                i.deferUpdate();

                if (i.values[0] === 'excuse_not_found') return;

                const newExcuses = document.excuses.filter((x) => x.reason !== i.values[0]);

                await question.edit({
                    components: [],
                    content: `${await client.getEmoji('check')} ${member} adlı kullanıcı için "${i.values[0]}" mazereti silindi!`,
                }).then((m) => { setTimeout(() => m.delete().catch(() => { }), 5000); }).catch(() => { });

                await StaffModel.updateOne(
                    { user: member.id },
                    {
                        $set: {
                            excuses: newExcuses.filter(Boolean)
                        }
                    },
                ).catch(() => { })

                collector.stop('ertu');
            });

            collector.on('end', (_, reason) => {
                if (reason === 'ertu') return;
                question.delete().catch(() => { });
            });

            return;
        };

        if (document && document.excuses.find((x) => x.reason === reason)) {
            const row = new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        custom_id: 'delete_excuse',
                        label: 'Sil',
                        style: ButtonStyle.Danger,
                    }),

                    new ButtonBuilder({
                        custom_id: 'cancel',
                        label: 'İptal',
                        style: ButtonStyle.Secondary,
                    }),
                ],
            });

            const question = await message.channel.send({
                embeds: [embed.setDescription(`${member} adlı yetkilinin "${reason}" mazeretini silmek istediğine emin misin?`)],
                components: [row],
            });

            const collector = question.createMessageComponentCollector({ componentType: ComponentType.Button, filter: m => m.user.id === message.author.id });

            collector.on('collect', async (i) => {
                i.deferUpdate();

                if (i.customId === 'cancel') return collector.stop();

                await question.edit({
                    components: [],
                    content: `${await client.getEmoji('check')} ${member} adlı kullanıcı için "${reason}" mazereti silindi!`,
                }).then((m) => { setTimeout(() => m.delete().catch(() => { }), 5000); }).catch(() => { });

                await StaffModel.updateOne(
                    { user: member.id },
                    {
                        $set: {
                            excuses: document.excuses.filter((x) => x.reason !== reason).filter(Boolean)
                        }
                    },
                ).catch(() => { })

                collector.stop('ertu');
            });

            collector.on('end', (_, reason) => {
                if (reason === 'ertu') return;
                question.delete().catch(() => { });
            });

            return;
        };

        message.channel.send(`${await client.getEmoji('check')} ${member} adlı kullanıcı için ${client.timestamp(Date.now() + ms(timing))} süreliğine "${reason}" mazeret oluşturuldu!`);

        await StaffModel.updateOne({ user: member.id }, {
            $push: {
                excuses: {
                    staff: message.author.id,
                    startAt: Date.now(),
                    endAt: Date.now() + ms(timing),
                    reason: reason,
                }
            }
        }).catch(() => { });
    },
};