const { PermissionsBitField: { Flags }, codeBlock } = require('discord.js');

module.exports = {
    Name: 'roldenetim',
    Aliases: ['rol-denetim'],
    Description: 'Belirttiğiniz rolün üye bilgilerini gösterir.',
    Usage: 'roldenetim <@Rol/ID>',
    Category: 'Advanced',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role || role.id === message.guild?.id) {
            client.embed(message, 'Geçerli bir rol belirtmelisiniz.');
            return;
        }

        const voiceMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(role.id) && m.voice.channelId);
        const notVoiceMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(role.id) && !m.voice.channelId);
        const activeAndNotVoiceMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(role.id) && !m.voice.channelId && m.presence && m.presence.status !== 'offline');
        const voiceText = voiceMembers.map((member) => `ID: <@${member.id}> - Kullanıcı Adı: ${member.displayName}`).join('\n');

        const voice = client.functions.splitMessage(`Seste Olanlar\n\n${voiceText}`, { maxLength: 2000, char: '\n' });
        const notVoiceText = notVoiceMembers.map((member) => `ID: <@${member.id}> - Kullanıcı Adı: ${member.displayName}`).join('\n');
        const notVoiceText2 = activeAndNotVoiceMembers.map((member) => `<@${member.id}>`).listArray()
        const notVoice = client.functions.splitMessage(
            `Seste Olmayanlar\n\n${notVoiceText}`,
            { maxLength: 2000, char: '\n' }
        );

        const notVoice2 = client.functions.splitMessage(`${notVoiceText2}`, { maxLength: 2000, char: '\n' });
        const array = [
            codeBlock('js', `Rol İsmi: ${role.name} (${role.id}) | ${role.members.size} Üye | Seste Olmayan Üye: ${notVoiceMembers.size} | Aktif Olup Seste Olmayan Üye: ${activeAndNotVoiceMembers.size}`),
            codeBlock('js', voice[0]),
            codeBlock('js', notVoice[0]),
            codeBlock('js', notVoice2[0].length !== 0 ? notVoice2[0] : '\u200b')
        ];

        for (const content of array) {
            if (content.length > 2000) {
                const chunks = client.functions.splitMessage(content, { maxLength: 2000 });
                for (const chunk of chunks) {
                    await message.channel.send({ content: chunk });
                }
            } else {
                await message.channel.send({ content });
            }
        }
    }
};