const { EmbedBuilder } = require('discord.js');
const rozetConfig = require('./rozet.config');
const { StaffModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'yukselt',
  Aliases: ['yükselt', 'rozet-yukselt'],
  Description: 'Rozet sistemine göre toplu yükseltme yapar.',
  Usage: 'yukselt @Rol',
  Category: 'Staff',
  Cooldown: 0,
  Permissions: {
    User: ["Administrator"],
    Role: []
  },
  Command: {
    Prefix: true,
  },
  messageRun: async (client, message, args, ertu) => {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply({ content: 'Bir rol etiketlemelisin!' });

    const badgeRoles = rozetConfig.yetkiler[0].badges || [];
    const mainRole = rozetConfig.yetkiler[0].mainRole;
    if (!badgeRoles.length || !mainRole) return message.reply({ content: 'Rozet sistemi setup ayarları eksik! Lütfen setup panelinden ayarlayın.' });

    const members = role.members.filter(m => !m.user.bot);
    if (!members.size) return message.reply({ content: 'Bu rolde hiç üye yok!' });

    let verilen1 = [], verilen2 = [], yukseltilen = [];
    for (const member of members.values()) {
      // Rozet 1 yoksa ver
      if (!member.roles.cache.has(badgeRoles[0])) {
        await member.roles.add(badgeRoles[0], 'Rozet sistemi yükseltme (Rozet 1)');
        verilen1.push(member);
        // Görev ve puanları sıfırla
        await StaffModel.updateOne(
          { user: member.id },
          {
            $set: {
              tasks: [],
              taskName: '',
              taskStartAt: 0,
              ticks: 0,
              bonusPoints: 0,
              dailyPoints: 0,
              totalPoints: 0,
              registerPoints: 0,
              publicPoints: 0,
              afkPoints: 0,
              streamerPoints: 0,
              activityPoints: 0,
              messagePoints: 0,
              invitePoints: 0,
              staffPoints: 0,
              taggedPoints: 0,
            }
          }
        );
        continue;
      }
      // Rozet 1 varsa, Rozet 2 yoksa ver
      if (badgeRoles[1] && member.roles.cache.has(badgeRoles[0]) && !member.roles.cache.has(badgeRoles[1])) {
        await member.roles.add(badgeRoles[1], 'Rozet sistemi yükseltme (Rozet 2)');
        verilen2.push(member);
        // Görev ve puanları sıfırla
        await StaffModel.updateOne(
          { user: member.id },
          {
            $set: {
              tasks: [],
              taskName: '',
              taskStartAt: 0,
              ticks: 0,
              bonusPoints: 0,
              dailyPoints: 0,
              totalPoints: 0,
              registerPoints: 0,
              publicPoints: 0,
              afkPoints: 0,
              streamerPoints: 0,
              activityPoints: 0,
              messagePoints: 0,
              invitePoints: 0,
              staffPoints: 0,
              taggedPoints: 0,
            }
          }
        );
        continue;
      }
      // Rozet 2 de varsa, ana yetki rolüne yükselt
      if (badgeRoles[1] && member.roles.cache.has(badgeRoles[1])) {
        await member.roles.add(mainRole, 'Rozet sistemi yükseltme (Ana Yetki)');
        await member.roles.remove(badgeRoles, 'Rozet sistemi yükseltme (Rozetler kaldırıldı)');
        yukseltilen.push(member);
        // Görev ve rozet sıfırlama
        await StaffModel.updateOne(
          { user: member.id },
          {
            $set: {
              tasks: [],
              taskName: '',
              taskStartAt: 0,
              ticks: 0,
              bonusPoints: 0,
              dailyPoints: 0,
              totalPoints: 0,
              registerPoints: 0,
              publicPoints: 0,
              afkPoints: 0,
              streamerPoints: 0,
              activityPoints: 0,
              messagePoints: 0,
              invitePoints: 0,
              staffPoints: 0,
              taggedPoints: 0,
            }
          }
        );
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Rozet Sistemi Toplu Yükseltme Sonucu')
      .setDescription([
        `• ${role} rolündeki toplam **${members.size}** üye tarandı.`,
        `• **${verilen1.length}** kişiye :first_place: 1. Rozet verildi.`,
        verilen1.length ? verilen1.map(m => `> ${m}`).join('\n') : '',
        `• **${verilen2.length}** kişiye :second_place: 2. Rozet verildi.`,
        verilen2.length ? verilen2.map(m => `> ${m}`).join('\n') : '',
        `• **${yukseltilen.length}** kişi :trophy: ana yetki rolüne yükseltildi.`,
        yukseltilen.length ? yukseltilen.map(m => `> ${m}`).join('\n') : '',
      ].filter(Boolean).join('\n\n'));
    message.channel.send({ embeds: [embed] });
  }
}; 