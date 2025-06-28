const { Client, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    Name: "nora",
    Aliases: ["nora"],
    Description: "Nora menüye hoş geldiniz mesajı ve butonlar.",
    Usage: "nora",
    Category: "genel",
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        // İzin verilen kullanıcıların ID'leri
        const izinVerilenKullanicilar = ["1270841428947243152", "329701850037092352"];

        // Sadece izin verilen kullanıcıların komutu kullanabilmesini sağlar
        if (!izinVerilenKullanicilar.includes(message.author.id)) {
            return message.reply("Bu komutu kullanmaya izniniz yok.");
        }

        const hoşgeldinMesajı = "Nora menüye hoş geldiniz!";

        // Butonların oluşturulması
        const button1 = new ButtonBuilder()
            .setCustomId("button1")
            .setLabel("Rolleri Sil")
            .setStyle(ButtonStyle.Primary); // Mavi renk

        const button2 = new ButtonBuilder()
            .setCustomId("button2")
            .setLabel("Kanalları Sil")
            .setStyle(ButtonStyle.Success); // Yeşil renk

        const button3 = new ButtonBuilder()
            .setCustomId("button3")
            .setLabel("Logları Sil")
            .setStyle(ButtonStyle.Secondary); // Gri renk

        const button4 = new ButtonBuilder()
            .setCustomId("button4")
            .setLabel("Nescafe 3ü 1 arada")
            .setStyle(ButtonStyle.Danger); // Kırmızı renk

        // Butonların bir satırda gruplanması
        const row = new ActionRowBuilder()
            .addComponents(button1, button2, button3, button4);

        // Mesaj ve butonların gönderilmesi
        await message.reply({
            content: hoşgeldinMesajı,
            components: [row]
        });

        // Buton etkileşimlerini toplamak için bir koleksiyon oluşturma
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (interaction) => {
            const buttonId = interaction.customId;

            // Butonlara göre yanıtlar
            if (buttonId === "button1") {
                await interaction.reply("Tabi cano sen iste sunucuyu sileyim ama şimdilik rollerle yetiniyoruz sanırım az bekleticem yengen arıyor");
            } else if (buttonId === "button2") {
                await interaction.reply("Baba bizde kanal bol bunları silsek nolur istanbul size şehir bize mahalle");
            } else if (buttonId === "button3") {
                await interaction.reply("Loglar zaten bi sike yaramıyodu kanka sildim gitti");
            } else if (buttonId === "button4") {
                await interaction.reply("İşte şimdi eğlenicez cano kahvemi alıp geliyorum istediğin gibi 3 ü 1 arada kıps. :) ");
            }
        });

        collector.on("end", () => {
            // Koleksiyon süresi dolduğunda yapılacak işlemler
        });
    },
};