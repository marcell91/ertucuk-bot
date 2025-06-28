const { Events } = require('discord.js');
const { Commands: { SlashCommandsHandler } } = require('../../../../Global/Handlers');
const { SecretRoom, MemberPanel, Streamer, Punish, Invasion, Menu, Solver, Task, Orientation, StreamerRoom, Bots, Responsibility, Punitive } = require('./Functions');
const { SettingsModel } = require('../../../../Global/Settings/Schemas'); 

module.exports = {
    Name: Events.InteractionCreate,
    System: true,

    execute: async (client, interaction) => {
        if (interaction.isAnySelectMenu()) {
            const value = interaction.customId.split(':')[0];
            const selected = interaction.values && interaction.values[0];
            const ertu = await SettingsModel.findOne({ id: interaction.guild.id });
            if (!ertu) return;

            if (value === 'task') return Task(client, interaction, selected, ertu);
            // Diğer select menu işlemleri burada kalabilir
        } else if (interaction.isButton() || interaction.isModalSubmit()) {
            const value = interaction.customId.split(':')[0];
            const ertu = await SettingsModel.findOne({ id: interaction.guild.id });
            if (!ertu) return;

            if (value === 'secretroom') return SecretRoom(client, interaction, interaction.customId.split(':')[1])
            if (value === 'member') return MemberPanel(client, interaction, interaction.customId.split(':')[1]);
            if (value === 'streamer') return Streamer(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'punish') return Punish(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'check') return Invasion(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'rolepanel') return Menu(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'solver') return Solver(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'staff') return Orientation(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'streamerRoom') return StreamerRoom(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'bots') return Bots(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'responsibility') return Responsibility(client, interaction, interaction.customId.split(':')[1], ertu);
            if (value === 'punitive') return Punitive(client, interaction, interaction.customId.split(':')[1], interaction.customId.split(':')[2], ertu);

            // GÖREV SEC BUTONU
            if (interaction.customId === 'gorev-sec') {
                const allowedRoles = Array.isArray(ertu.settings?.taskPanelAuth)
                    ? ertu.settings.taskPanelAuth
                    : ertu.settings?.taskPanelAuth
                        ? [ertu.settings.taskPanelAuth]
                        : [];
                if (!allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    return interaction.reply({ content: 'Görev almak için yetkili olmalısın.', ephemeral: true });
                }
                // Sadece görev türleri embedini ve select menu'yu gönder
                const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
                const gorevler = [
                    {
                        name: 'Chat Görevi',
                        details: [
                            'Genel Ses: 50 saat',
                            'AFK Ses: 5 saat',
                            'Streamer Ses: 10 saat',
                            'Yetkili Sayısı: 2',
                            'Problem Çözme: 5',
                            'Oryantasyon: 5',
                            'Kayıt: 15',
                            'Reaksiyon: 5',
                            'Rol Denetimi: 300',
                            'Mesaj: 3000'
                        ]
                    },
                    {
                        name: 'Public Görevi',
                        details: [
                            'Genel Ses: 50 saat',
                            'AFK Ses: 25 saat',
                            'Streamer Ses: 25 saat',
                            'Yetkili Sayısı: 2',
                            'Problem Çözme: 5',
                            'Oryantasyon: 5',
                            'Kayıt: 15',
                            'Reaksiyon: 5',
                            'Rol Denetimi: 300',
                            'Mesaj: 3000'
                        ]
                    },
                    {
                        name: 'Streamer Görevi',
                        details: [
                            'Genel Ses: 50 saat',
                            'AFK Ses: 25 saat',
                            'Streamer Ses: 25 saat',
                            'Yetkili Sayısı: 2',
                            'Problem Çözme: 5',
                            'Oryantasyon: 5',
                            'Kayıt: 15',
                            'Reaksiyon: 5',
                            'Rol Denetimi: 300',
                            'Mesaj: 3000'
                        ]
                    }
                ];

                const detailEmbed = new EmbedBuilder()
                    .setTitle('Görev Türleri ve Gereksinimleri')
                    .setDescription('Aşağıda görev türleri ve gereksinimleri kutulu şekilde listelenmiştir:')
                    .addFields(
                        gorevler.map(g => ({
                            name: `🟪 ${g.name}`,
                            value: g.details.map(d => `> ${d}`).join('\n'),
                            inline: false
                        }))
                    );

                const selectMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('task')
                        .setPlaceholder('Görev Türleri')
                        .addOptions([
                            { label: 'Chat Görevi', value: 'message' },
                            { label: 'Public Görevi', value: 'public' },
                            { label: 'Streamer Görevi', value: 'streamer' },
                            { label: 'Yetkili Alım Görevi', value: 'staff' },
                        ])
                );
                return interaction.reply({ embeds: [detailEmbed], components: [selectMenu], ephemeral: true });
            }
        }

        if (interaction.isCommand()) {
            return await SlashCommandsHandler(client, interaction);
        }
    }
};