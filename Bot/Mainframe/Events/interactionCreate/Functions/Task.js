const { EmbedBuilder, codeBlock } = require('discord.js');
const { StaffModel } = require('../../../../../Global/Settings/Schemas')

module.exports = async function Task(client, interaction, route, ertu) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member) return;

    if (!client.staff.check(member, ertu)) return interaction.reply({ content: 'Bu butonu kullanabilmek için yetkiniz bulunmamakta!', ephemeral: true });

    const { currentRank } = client.staff.getRank(member, ertu);
    if (!currentRank) return interaction.deferUpdate();
    if (currentRank.type == 'sub') return interaction.reply({ content: 'Bu butonu kullanabilmek için yetkiniz bulunmamakta!', ephemeral: true });

    const document = await StaffModel.findOne({ user: member.id })
    if (document?.tasks?.length > 0) return interaction.reply({ content: 'Zaten bir göreviniz bulunmakta!', ephemeral: true });

    // Görev türüne göre ayar
    let taskName, filterType, removeType, successMsg;
    if (route === 'streamer') {
        taskName = 'Streamer';
        filterType = 'STREAMER';
        removeType = 'PUBLIC';
        successMsg = 'Streamer görevini başarıyla aldınız!';
    } else if (route === 'public') {
        taskName = 'Public';
        filterType = 'PUBLIC';
        removeType = 'STREAMER';
        successMsg = 'Public görevini başarıyla aldınız!';
    } else if (route === 'message') {
        taskName = 'Mesaj';
        filterType = 'MESSAGE';
        removeType = null;
        successMsg = 'Chat görevini başarıyla aldınız!';
    } else if (route === 'staff') {
        taskName = 'Yetkili Alım';
        filterType = 'STAFF';
        removeType = null;
        successMsg = 'Yetkili alım görevini başarıyla aldınız!';
    } else {
        return interaction.reply({ content: 'Geçersiz görev türü!', ephemeral: true });
    }

    // Görevleri ata
    await StaffModel.updateOne(
        { user: member.id },
        {
            $set: {
                tasks: currentRank?.tasks.map((t) => ({
                    type: t.TYPE,
                    name: t.NAME,
                    count: 0,
                    required: t.COUNT,
                    completed: false,
                })),
                taskStartAt: Date.now(),
                taskName: taskName,
            },
        },
        { upsert: true }
    );

    // Gerekirse diğer görev türünü sil
    if (removeType) {
        await StaffModel.findOneAndUpdate(
            { user: member.id },
            { $pull: { tasks: { type: removeType } } },
            { new: true, upsert: true }
        );
    }

    // Mesaj ve staff için ek gereksinim artırımı
    if (route === 'message') {
        if (currentRank.type === 'middle') {
            await StaffModel.findOneAndUpdate(
                { user: member.id, 'tasks.type': 'MESSAGE' },
                { $inc: { 'tasks.$[elem].required': 1900 } },
                { arrayFilters: [{ 'elem.type': 'MESSAGE' }], new: true, upsert: true }
            );
        } else {
            await StaffModel.findOneAndUpdate(
                { user: member.id, 'tasks.type': 'MESSAGE' },
                { $inc: { 'tasks.$[elem].required': 2900 } },
                { arrayFilters: [{ 'elem.type': 'MESSAGE' }], new: true, upsert: true }
            );
        }
    }
    if (route === 'staff') {
        if (currentRank.type === 'middle') {
            await StaffModel.findOneAndUpdate(
                { user: member.id, 'tasks.type': 'STAFF' },
                { $inc: { 'tasks.$[elem].required': 10 } },
                { arrayFilters: [{ 'elem.type': 'STAFF' }], new: true, upsert: true }
            );
        } else {
            await StaffModel.findOneAndUpdate(
                { user: member.id, 'tasks.type': 'STAFF' },
                { $inc: { 'tasks.$[elem].required': 25 } },
                { arrayFilters: [{ 'elem.type': 'STAFF' }], new: true, upsert: true }
            );
        }
    }

    // Embed ile kullanıcıya bilgi ver
    const embed = new EmbedBuilder({
        color: client.getColor('random'),
        description: [
            `**${successMsg}**`,
            '',
            `Aldığınız Görevler;`,
            codeBlock('yaml', currentRank?.tasks.map((t) => `- ${t.NAME} ${t.COUNT_TYPE === 'TIME' ? `(${client.functions.formatDurations(t.COUNT)})` : `(${t.COUNT})`} ${t.COUNT_TYPE === 'TIME' ? 'süre' : 'adet'}`).join('\n')),
        ].join('\n'),
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
};