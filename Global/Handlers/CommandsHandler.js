const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { SettingsModel } = require('../Settings/Schemas')

const MessageCommandsHandler = async function (client, message) {
    if (!message.guild || message.author.bot) return;
    if (message.guild.id !== client.system.serverID) {
        message.channel.send(`Bi sen akıllısın amın oğlu siktir git o ananı sikerim senın amına kodugumun cocugu`)
        return message.guild.leave();
    }

    const prefixes = [...client.ertu.Prefix, `<@${client.user.id}>`, `<@!${client.user.id}>`];
    const content = message.content;
    const ertu = await SettingsModel.findOne({ id: message.guild.id });

    const embed = new EmbedBuilder({
        color: client.getColor('random'),
        author: {
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 })
        }
    });

    const prefixUsed = prefixes.find(p => content.startsWith(p));
    let args;

    if (prefixUsed) {
        args = content.slice(prefixUsed.length).trim().split(/ +/);
        const command = args[0].toLowerCase();
        var cmd = client.commands.get(command) || client.aliases.get(command)
        args.shift();

        if (!cmd && [`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(prefixUsed)) {
            cmd = client.commands.get(args[0]) || client.aliases.get(command)
            args.shift();
        };
    };

    if (cmd) {
        const cooldown = client.cooldowns.get(`${cmd.Name}-${message.author.id}`);
        if (!message.channel.permissionsFor(message.guild.members.me).has('SendMessages')) return;

        if (cooldown && cooldown.Activated) return;

        if (cmd.Category === 'Root' && !client.system.ownerID.includes(message.author.id) && message.author.id !== '136619876407050240') return;
        let canExecute = false;

        const botCommandChannels = ertu.settings.botCommandChannels;
        if (botCommandChannels &&
            botCommandChannels.length > 0 &&
            !botCommandChannels.includes(message.channel.id) &&
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
            !ertu.settings.founders.some((role) => message.member.roles.cache.has(role)) &&
            cmd.Name !== 'sil' &&
            cmd.Name !== 'tag' &&
            cmd.Name !== 'snipe' 
        ) return client.embed(message, `Bu komutu sadece bot komut kanallarında kullanabilirsin!`);

        if (['General', 'Statistics'].includes(cmd.Category) || message.guild?.ownerId === message.author.id || client.system.ownerID.includes(message.author.id)) canExecute = true;

        const canExecuteData = Object.keys(ertu.cmdPerms || {}).some((key) => key === cmd.Category) ? ertu.cmdPerms[cmd.Category] : null;

        if (
            canExecuteData &&
            canExecuteData.access?.some((id) => id === message.author.id || message.member?.roles.cache.has(id)) ||
            canExecuteData?.commands.find((c) => c.command === cmd.Name)?.access.some((id) => id === message.author.id || message.member?.roles.cache.has(id)) ||
            message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            ertu.settings.founders.some((role) => message.member.roles.cache.has(role))
        ) canExecute = true;

        if (cooldown && Date.now() < cooldown.Expiration) {
            client.embed(message, `Bu komutu tekrar çalıştırmadan önce ${client.timestamp(cooldown.Expiration)} bekle!`, Math.ceil((cooldown.Expiration - Date.now()) / 1000))
            return client.cooldowns.set(`${cmd.Name}-${message.author.id}`, {
                Activated: true,
            });
        };

        try {
            if (!canExecute) return;
            await cmd.messageRun(client, message, args, ertu, embed);
        } catch (err) {
            client.embed(message, `Bir hata meydana geldi ve bu durumu bot sahiplerine ilettik. Sorunu en kısa sürede gidermek için çaba gösteriyoruz. Anlayışınız için teşekkür ederiz!`);

            return client.logger.error('@messageRun', {
                error: err,
                guild: message.guild,
                client: client,
            });
        } finally {
            if (cmd.Cooldown > 0 && !cooldown) {
                client.cooldowns.set(`${cmd.Name}-${message.author.id}`, {
                    Expiration: Date.now() + (cmd.Cooldown * 1000),
                    Activated: false,
                });
            }

            setTimeout(() => {
                if (client.cooldowns.get(`${cmd.Name}-${message.author.id}`))
                    return client.cooldowns.delete(`${cmd.Name}-${message.author.id}`);
            }, cmd.Cooldown * 1000);
        };
    };
};

const SlashCommandsHandler = async function (client, interaction) {
    const
        guild = interaction.guild,
            cmd = client.slashCommands.get(interaction.commandName),
        channel = guild?.channels.cache.get(interaction.channelId),
        member = guild?.members.cache.get(interaction.user.id);

    const cooldown = client.cooldowns.get(`${cmd.Name}-${interaction.user.id}`);

    if (!cmd || cooldown && cooldown.Activated) return;

    if (cmd.Category === 'Root' && !client.system.ownerID.includes(interaction.user.id) && interaction.user.id !== '136619876407050240') return;

    if (guild) {
        let neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.Bot) cmd.Permissions.Bot.forEach((perm) => {
            if (!channel.permissionsFor(client.user)?.has(perm)) {
                neededPermissions.push(perm);
            };
        });

        if (neededPermissions.length > 0) {
            const perms = new PermissionsBitField();
            neededPermissions.forEach((item) => perms.add(BigInt(item)));
            if (interaction.channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
                return interaction.user.send({ content: `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim` }).then(() => {
                }).catch(() => {
                    return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
                });
            } else {
                return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
            }
        };

        neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.User) cmd.Permissions.User.forEach((perm) => {
            if (!interaction.channel.permissionsFor(interaction.user).has(perm)) {
                neededPermissions.push(perm);
            }
        });

        if (neededPermissions.length > 0) {
            const perms = new PermissionsBitField();
            neededPermissions.forEach((item) => perms.add(BigInt(item)));
            return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilsin!`)
        };

        neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.Role) cmd.Permissions.Role.forEach((group) => {
            const hasRoleInGroup = group.some((role) =>
                member.roles.cache.some((userRole) => userRole.id === role)
            );

            if (!hasRoleInGroup) {
                missingRoles.push(group.join(', '));
            }
        });

        if (neededPermissions.length > 0) return interaction.react('❌');
    }

    if (cooldown && Date.now() < cooldown.Expiration) {
        client.embed(interaction, `Bu komutu tekrar çalıştırmadan önce ${client.timestamp(cooldown.Expiration)} bekle!`, Math.ceil((cooldown.Expiration - Date.now()) / 1000))
        return client.cooldowns.set(`${cmd.Name}-${interaction.user.id}`, {
            Activated: true,
        });
    };

    try {
        await interaction.deferReply({ ephemeral: cmd.Command.Ephemeral });
        const settings = interaction.guild.settings
        await cmd.interactionRun(client, interaction, { settings });
    } catch (ex) {
        client.embed(interaction, `Bir hata meydana geldi ve bu durumu bot sahiplerine ilettik. Sorunu en kısa sürede gidermek için çaba gösteriyoruz. Anlayışınız için teşekkür ederiz!`);

        client.logger.error('@interactionRun', {
            error: ex,
            guild: interaction.guild,
            client: client,
        });
    } finally {
        if (cmd.Cooldown > 0 && !cooldown) {
            client.cooldowns.set(`${cmd.Name}-${interaction.user.id}`, {
                Expiration: Date.now() + (cmd.Cooldown * 1000),
                Activated: false,
            });
        }

        setTimeout(() => {
            if (client.cooldowns.get(`${cmd.Name}-${interaction.user.id}`))
                client.cooldowns.delete(`${cmd.Name}-${interaction.user.id}`);
        }, cmd.Cooldown * 1000);
    };
};

module.exports = { SlashCommandsHandler, MessageCommandsHandler }