const { ActionRowBuilder, ButtonBuilder, ButtonStyle, bold, userMention } = require('discord.js')
const { PunitiveModel } = require('../../../../../Global/Settings/Schemas');

module.exports = async function Punitive(client, interaction, route, id, ertu) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member) return interaction.deferUpdate();

    const message = await interaction.channel.messages.fetch(interaction.message.id);

    if (route === 'true') {
        message.edit({
            content: `✅ ${member} tarafından bu cezanın **Düzgün** olduğu onaylandı!`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`punitive_confirmed`)
                        .setLabel(`✅ ${member.user.username} Tarafından Kontrol Edildi!`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                )
            ]
        });

        interaction.reply({ content: `İşlem başarılı!`, ephemeral: true });
    }

    if (route === 'false') {

        message.edit({
            content: `❌ ${member} tarafından bu cezanın **Hatalı** olduğu belirlendi!`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`punitive_no`)
                        .setLabel(`❌ ${member.user.username} Tarafından Kontrol Edildi!`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                )
            ]
        });

        interaction.reply({ content: `İşlem başarılı!`, ephemeral: true });

        await PunitiveModel.updateOne({ id }, { $set: { active: false, remover: member.id, removedTime: Date.now(), removeReason: 'Hatalı Cezalandırma' } });

        const penal = await PunitiveModel.findOne({ id });
        if (!penal) return;
 
        const user = interaction.guild.members.cache.get(penal.user);

        if (penal.type === 'Underworld') {
            user.roles.set(penal.roles);
        };

        if (penal.type === 'Quarantine') {
            user.roles.set(penal.roles);
        };

        if (penal.type === 'Ads') {
            user.roles.set(penal.roles);
        };

        if (penal.type === 'ChatMute') {
            user.roles.remove(ertu.settings.chatMuteRole);
        };

        if (penal.type === 'VoiceMute') {
            user.roles.remove(ertu.settings.voiceMuteRole);
        };

        if (penal.type === 'Event') {
            user.roles.remove(ertu.settings.eventPenaltyRole);
        }

        if (penal.type === 'Streamer') {
            user.roles.remove(ertu.settings.streamerPenaltyRole);
        }

        await client.functions.calculateWrongPunitivies(user);
    }
}