const ms = require('ms');
const { spoiler } = require('discord.js');

module.exports = async function Solver(client, interaction, route, ertu) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member) return;

    const limit = client.functions.checkLimit(interaction.user.id, 'Solver', 1, ms('1h'));
    if (limit.hasLimit) return interaction.reply({ content: `Bu butonu ${limit.time} kullanabilirsin.`, ephemeral: true });

    const solverChannel = interaction.guild.channels.cache.find((x) => x.name === 'sorun-çözme-chat');
    if (!solverChannel) return interaction.reply({ content: 'Sorun çözme kanalı bulunamadı.', ephemeral: true });

    interaction.reply({ content: 'Başarıyla sorun çözücü çağırdın.', ephemeral: true });
    solverChannel.send({
        content: `${interaction.member} kullanıcısı bir sorun çözücü çağırıyor!\n${spoiler(ertu.settings.solvingStaffs.map(x => `<@&${x}>`).join(', '))}`,
    })
}