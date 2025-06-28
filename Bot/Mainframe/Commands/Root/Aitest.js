const { PermissionsBitField: { Flags } } = require('discord.js');
const Findcord = require('findcord').default; // findcord kütüphanesini ekleyin
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'aiktoplu',
    Aliases: ['aisik', 'aiks'],
    Description: 'Roldeki kullanıcıları tek tek kaydeder.',
    Usage: 'aikayit',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        const noRoleId = '1338969275863531602'; // Kayıtsız rol ID'si
        try {
            const guild = message.guild;
            const noRole = guild.roles.cache.get(noRoleId);
            if (!noRole) return message.reply("Belirtilen rol bulunamadı!");

            const membersWithNoRole = noRole.members.map(member => member);
            if (membersWithNoRole.length === 0) {
                return message.reply("Kayıtsız rolüne sahip kullanıcı bulunamadı.");
            }

            message.reply(`${membersWithNoRole.length} kayıtsız kullanıcı işleniyor...`);

            let successCount = 0;
            let failCount = 0;

            for (const member of membersWithNoRole) {
                try {
                    const result = await processMember(member, guild);
                    if (result) {
                        successCount++;
                        await message.reply(`${member} başarıyla kaydedildi.`);
                    } else {
                        failCount++;
                        await message.reply(`${member} verilerine ulaşamadım.`);
                    }
                } catch (error) {
                    failCount++;
                    console.error(`Kullanıcı işleme hatası (${member.id}):`, error);
                    await message.reply(`${member} işlenirken bir hata oluştu.`);
                }
                await delay(1000); // Her kullanıcıdan sonra 1 saniye bekle
            }

            message.reply(`İşlem tamamlandı! Başarılı: ${successCount}, Başarısız: ${failCount}`);
        } catch (error) {
            console.error("Toplu kayıt hatası:", error);
            message.reply("Toplu kayıt sırasında bir hata oluştu.");
        }
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processMember = async (member, guild) => {
    try {
        const existingRoles = member.roles.cache;
        const maleRole = guild.roles.cache.get('1338969274869612656');
        const femaleRole = guild.roles.cache.get('1338969272977723463');

        // Eğer kullanıcı zaten erkek veya kadın rolüne sahipse işlem yapma
        if (existingRoles.has(maleRole.id) || existingRoles.has(femaleRole.id)) {
            return null;
        }

        // API'den kullanıcı verilerini çek
        const userData = await fetchUserData(member.id);
        if (!userData) {
            return false;
        }

        // Rolleri güncelle ve kullanıcıyı kaydet
        await updateRoles(member, userData.gender, guild);
        await member.setNickname(`✦ ${userData.name} | ${userData.age}`);
        return true;
    } catch (error) {
        console.error(`Kullanıcı işleme hatası (${member.id}):`, error);
        return false;
    }
};

const fetchUserData = async (discordId) => {
    try {
        const apiKey = 'ffe0576a1a3cf9d3a57d14b7381bd60683f6ca0cf3f4372a1138114146c891e2'; // API anahtarınızı buraya ekleyin
        const findcord = new Findcord(apiKey);

        // Kullanıcı verilerini çek
        const query = await findcord.query(discordId);
        if (!query || !query.name || !query.age) {
            return null;
        }

        // Gender bilgisini kontrol et
        if(query.sex == "unisex") return null 
    
        const gender = query.sex ? query.sex.toLowerCase() : 'Belirtilmemiş';
        return {
            name: query.name,
            age: query.age,
            gender: gender === 'erkek' ? 'erkek' : gender === 'kadin' ? 'Kadın' : 'Belirtilmemiş'
        };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error(`Kullanıcı bulunamadı (${discordId}):`, error.message);
        } else {
            console.error(`API veri çekme hatası (${discordId}):`, error.message);
        }
        return null;
    }
};

const updateRoles = async (member, gender, guild) => {
    try {
        const maleRole = guild.roles.cache.get('1338969274869612656');
        const femaleRole = guild.roles.cache.get('1338969272977723463');
        const noRole = guild.roles.cache.get('1338969275863531602');

        // Kayıtsız rolünü kaldır
        if (member.roles.cache.has(noRole.id)) {
            await member.roles.remove(noRole);
        }

        // Cinsiyete göre rol ata
        console.log(gender)
        const roleToAssign = gender === 'erkek' ? maleRole : femaleRole;
        if (roleToAssign) await member.roles.add(roleToAssign);
    } catch (error) {
        console.error(`Rol güncelleme hatası (${member.id}):`, error);
    }
};