module.exports = {
    Name: 'restart',
    Aliases: ['r', 'res', 'reboot'],
    Description: 'Botu yeniden başlatır.',
    Usage: 'restart <bot seçiniz>',
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
        process.exit(0);
    },
};