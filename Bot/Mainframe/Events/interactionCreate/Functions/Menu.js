module.exports = async function Menu(client, interaction, route, ertu) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member) return;

    const key = interaction.isButton() ? route : interaction.values[0];

    if (key === 'giveaway') {
        const giveawayRole = await interaction.guild.roles.cache.find(x => x.name.includes('Çekiliş Duyuru'))

        if (member.roles.cache.has(giveawayRole.id)) {
            await member.roles.remove(giveawayRole.id);
            interaction.reply({ content: `Başarıyla <@&${giveawayRole.id}> rolü üzerinizden alındı.`, ephemeral: true })
        } else {
            await member.roles.add(giveawayRole.id);
            interaction.reply({ content: `Başarıyla <@&${giveawayRole.id}> rolü üzerinize verildi.`, ephemeral: true })
        };
    };

    if (key === 'event') {
        const eventRole = await interaction.guild.roles.cache.find(x => x.name.includes('Etkinlik Duyuru'))

        if (member.roles.cache.has(eventRole.id)) {
            await member.roles.remove(eventRole.id);
            interaction.reply({ content: `Başarıyla <@&${eventRole.id}> rolü üzerinizden alındı.`, ephemeral: true })
        } else {
            await member.roles.add(eventRole.id);
            interaction.reply({ content: `Başarıyla <@&${eventRole.id}> rolü üzerinize verildi.`, ephemeral: true })
        };
    };

    if (route === 'color') {
        const colorRoles = [
            'Gri',
            'Siyah',
            'Beyaz',
            'Kırmızı',
            'Mavi',
            'Sarı',
            'Yeşil',
            'Mor',
            'Turuncu',
            'Pembe',
            'Kahverengi'
        ];

        const foundRoles = interaction.guild.roles.cache.filter(r => colorRoles.includes(r.name));
        const removeRoles = interaction.member.roles.cache.filter(r => colorRoles.includes(r.name)) || [];

        if (key.includes('clear')) {
            if (removeRoles.map(x => `${x.name}`).length == 0) return interaction.reply({ content: 'Üzerinizde rol bulunmuyor.', ephemeral: true })
            removeRoles.forEach(x => {
                interaction.member.roles.remove(x);
            });

            return interaction.reply({ content: `${removeRoles.map(x => `${x}`)} rolü başarıyla silindi!`, ephemeral: true });
        }

        for (i = 0; i < key.length; i++) {
            if (foundRoles.find(r => r.name.toLowerCase() === key)) {
                const colorRole = interaction.guild.roles.cache.find(x => x.name.toLowerCase() === key);
                if (removeRoles.length != 0) {
                    removeRoles.forEach(x => {
                        interaction.member.roles.remove(x);
                    });
                }

                interaction.member.roles.add(colorRole.id);
                interaction.reply({
                    content: `<@&${colorRole.id}> rolü başarıyla eklendi!`,
                    ephemeral: true
                });
            }
        }
    }

    if (route === 'ship') {
        const shipRoles = [
            'Couple',
            'Alone'
        ];

        const foundRoles = interaction.guild.roles.cache.filter(r => shipRoles.includes(r.name));
        const removeRoles = interaction.member.roles.cache.filter(r => shipRoles.includes(r.name)) || [];

        if (key.includes('clear')) {
            if (removeRoles.map(x => `${x.name}`).length == 0) return interaction.reply({ content: 'Üzerinizde rol bulunmuyor.', ephemeral: true })
            removeRoles.forEach(x => {
                interaction.member.roles.remove(x);
            });

            return interaction.reply({ content: `${removeRoles.map(x => `${x}`)} rolü başarıyla silindi!`, ephemeral: true });
        }

        for (i = 0; i < key.length; i++) {
            if (foundRoles.find(r => r.name.toLowerCase() === key)) {
                const shipRole = interaction.guild.roles.cache.find(x => x.name.toLowerCase() === key);
                if (removeRoles.length != 0) {
                    removeRoles.forEach(x => {
                        interaction.member.roles.remove(x);
                    });
                }

                interaction.member.roles.add(shipRole.id);
                interaction.reply({
                    content: `<@&${shipRole.id}> rolü başarıyla eklendi!`,
                    ephemeral: true
                });
            }
        }
    }
}