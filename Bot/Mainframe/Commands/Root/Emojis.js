module.exports = {
    Name: 'emojikur',
    Aliases: [],
    Description: 'Sunucu için emojileri oluşturur.',
    Usage: 'emojikur',
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
        await Promise.all(client.data.emojis.map(async (x) => {
            if (message.guild.emojis.cache.find((e) => x.name === e.name)) return;
            const emoji = await message.guild.emojis.create({ attachment: x.url, name: x.name });
            return message.channel.send({ content: `\`${x.name}\` isimli emoji oluşturuldu! (${emoji.toString()})`, ephemeral: true });
        }));
    },
};