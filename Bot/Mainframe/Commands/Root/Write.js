module.exports = {
    Name: 'yaz',
    Aliases: ['write'],
    Description: 'Botun yazmasını istediğiniz şeyi belirtin.',
    Usage: 'yaz <yazılacak şey>',
    Category: 'Root',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => {
        await message.delete()
        message.channel.send(args.join(' '));
    },
};