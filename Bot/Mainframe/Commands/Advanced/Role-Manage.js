const { PermissionsBitField: { Flags }, bold, inlineCode, roleMention } = require('discord.js');
const { UserModel } = require('../../../../Global/Settings/Schemas');

const dangerNames = [
    'bot',
    'mute',
    'developer',
    'developed',
    'lideri',
    'denetleyici',
    'sorumlusu',
    'underworld',
    'cezalı',
    '▬'
];

const dangerPerms = [
    Flags.Administrator,
    Flags.KickMembers,
    Flags.ManageGuild,
    Flags.BanMembers,
    Flags.ManageRoles,
    Flags.ManageWebhooks,
    Flags.ManageNicknames,
    Flags.ManageChannels,
];

module.exports = {
    Name: 'rol',
    Aliases: [],
    Description: 'Belirttiğiniz üyeye rol verip çıkarırsınız.',
    Usage: 'rol <@User/ID>',
    Category: 'Advanced',
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
        if (!member) return client.embed(message, 'Geçerli bir üye belirtmelisiniz.');

        const guildRoles = message.guild?.roles.cache
            .filter(role =>
                role.name !== '@everyone' &&
                !dangerNames.some(name => role.name.toLowerCase().includes(name)) &&
                !dangerPerms.some(perm => role.permissions.has(perm))
            )
            .sort((a, b) => b.position - a.position)
            .map(role => role.id);

        const chunkSize = 25;
        let currentPage = 0;

        const generatePage = (page) => {
            const start = page * chunkSize;
            const paginatedRoles = guildRoles.slice(start, start + chunkSize);
            return paginatedRoles.map((role, index) =>
                `${inlineCode(` ${start + index + 1}. `)} ${roleMention(role)} ${member.roles.cache.has(role) ? '✅' : '❌'}`
            ).join('\n');
        };

        const updateMessage = async (msg, page) => {
            const roleText = generatePage(page);
            const navigation = `${inlineCode('0')} ${bold('İşlemi iptal et.')} | Sayfa ${page + 1}/${Math.ceil(guildRoles.length / chunkSize)}`;
            await msg.edit({
                embeds: [
                    embed.setDescription(`${navigation}\n\n${roleText}`)
                ]
            });
        };

        const initialEmbed = await message.channel.send({
            embeds: [embed.setDescription(generatePage(currentPage))]
        });

        await initialEmbed.react('⬅️');
        await initialEmbed.react('❌');
        await initialEmbed.react('➡️');

        const filter = (reaction, user) => {
            return ['⬅️', '❌', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const collector = initialEmbed.createReactionCollector({ filter: filter, time: 1000 * 60 * 5 });
        const messageCollector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, time: 1000 * 60 * 5 });

        collector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '❌') {
                collector.stop('cancelled');
                messageCollector.stop('cancelled');
                return;
            }

            if (reaction.emoji.name === '⬅️') {
                currentPage = currentPage > 0 ? currentPage - 1 : currentPage;
            } else if (reaction.emoji.name === '➡️') {
                currentPage = currentPage < Math.ceil(guildRoles.length / chunkSize) - 1 ? currentPage + 1 : currentPage;
            }

            await updateMessage(initialEmbed, currentPage);
            await reaction.users.remove(message.author.id);
        });

        messageCollector.on('collect', async (m) => {
            if (m.content === '0') {
                collector.stop('cancelled');
                messageCollector.stop('cancelled');
                return;
            }

            const roleNumbers = m.content.split(' ').filter(r => !isNaN(parseInt(r)));
            if (!roleNumbers.length) {
                message.channel.send('Geçerli bir rol numarası belirtmelisiniz.').then(msg => setTimeout(() => msg.delete(), 5000));
                collector.stop('cancelled');
                messageCollector.stop('cancelled');
                return;
            }

            const selectedRoles = roleNumbers.map(r => guildRoles[parseInt(r) - 1]).filter(Boolean);
            const addedRoles = selectedRoles.filter(r => !member.roles.cache.has(r));
            const removedRoles = selectedRoles.filter(r => member.roles.cache.has(r));

            if (addedRoles.length) {
                await member.roles.add(addedRoles).catch(() => { });
                await UserModel.updateOne({ id: member.id }, { $push: { roleLogs: { type: 'add', roles: addedRoles, staff: message.author.id, date: Date.now() } } });
            }

            if (removedRoles.length) {
                await member.roles.remove(removedRoles).catch(() => { });
                await UserModel.updateOne({ id: member.id }, { $push: { roleLogs: { type: 'remove', roles: removedRoles, staff: message.author.id, date: Date.now() } } });
            }

            const resultMessage = [
                addedRoles.length ? `Eklenen Roller: ${addedRoles.map(r => roleMention(r)).join(', ')}` : '',
                removedRoles.length ? `Kaldırılan Roller: ${removedRoles.map(r => roleMention(r)).join(', ')}` : ''
            ].filter(Boolean).join('\n');

            message.channel.send({
                embeds: [embed.setDescription(resultMessage || 'Belirttiğiniz roller zaten mevcut durumda.')]
            });

            await updateMessage(initialEmbed, currentPage);
            messageCollector.stop('cancelled');
            collector.stop('cancelled');
        });

        collector.on('end', (_, reason) => {
            if (reason === 'cancelled') {
                initialEmbed.delete().catch(() => { });
            }
        });

        messageCollector.on('end', (_, reason) => {
            if (reason === 'cancelled') return;
            initialEmbed.delete().catch(() => { });
        });
    },
};