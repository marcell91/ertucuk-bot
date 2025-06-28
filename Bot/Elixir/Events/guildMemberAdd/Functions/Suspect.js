const { inlineCode } = require('discord.js');

module.exports = async function Suspect(client, member, ertu, channel) {
    if (Date.now() - member.user.createdTimestamp > 1000 * 60 * 60 * 24 * 7) return false;

    await member.setRoles(ertu.settings.suspectedRole);

    channel.send({
        content: `${member} (${inlineCode(`${member.user.username} - ${member.user.id}`)}) adlı kullanıcının hesabı 7 günden az bir sürede açıldığı için şüpheliye atıldı.`
    });

    return true;
}