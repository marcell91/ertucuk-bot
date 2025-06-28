const { PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'rolbilgis',
    Aliases: ['rolebilgi'],
    Description: 'Belirtilen rolün bilgilerini gösterir.',
    Usage: 'rol <rol etiketi veya ID>',
    Category: 'Utility',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu) => {
        // Kullanıcı rol ID veya etiket girmezse hata ver
        if (!args[0]) {
            client.embed(message, 'Lütfen bir rol etiketi veya ID girin!');
            return;
        }

        // Rolü bul
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) {
            client.embed(message, 'Belirtilen rolü bulamadım!');
            return;
        }

        // Rol bilgileri
        let roleName = role.name;
        let roleColor = role.hexColor;
        let roleId = role.id;
        let members = role.members.size > 0 
            ? role.members.map((m, i) => `${i + 1} - (${m.id}) - <@${m.id}>`).join('\n')
            : 'Bu rolde kimse yok.';

        // Üyeler listesi 1024 karakteri aşarsa kes
        if (members.length > 1024) {
            members = members.slice(0, 1000) + '... (daha fazla üye var)';
        }

        // Embed mesajı oluştur
        const embed = new EmbedBuilder()
            .setColor(roleColor)
            .setTitle(`${roleName} rol bilgileri`)
            .setDescription(`- **Rol Rengi:** ${roleColor}\n- **Rol ID:** ${roleId}\n- **Rol Kişi Sayısı:** ${role.members.size}`)
            .addFields({ name: 'Üyeler', value: members })
            .setFooter({ text: 'Rol bilgileri' });

        // Mesajı gönder
        await message.reply({ embeds: [embed] });
    },
};