const { EmbedBuilder, MessageFlags, roleMention } = require('discord.js');
const { StaffModel, SettingsModel } = require('../Settings/Schemas')

module.exports = class Staff {

  static check(member, ertu) {
    return member.roles.cache.some((r) => [...ertu.staffRanks].some((rr) => rr.role === r.id));
  };

  static getRank(member, ertu) {
    if (!ertu.staffRanks.length) return { currentRank: undefined, newRank: undefined };

    const sortedRoles = ertu.staffRanks.sort((a, b) => a.place - b.place);
    const currentIndex = sortedRoles.findIndex((r) => member.roles.cache.map(x => x.id).includes(r.role));

    return {
      currentRank: sortedRoles[currentIndex] || undefined,
      currentIndex: currentIndex,
      newRank: sortedRoles[currentIndex + 1] || undefined,
      newIndex: currentIndex + 1,
      type: sortedRoles[currentIndex]?.type || undefined,
    };
  };

  static async checkRank(client, member, ertu, options = { type, amount, user, point }) {
    const { currentRank, newRank } = Staff.getRank(member, ertu);
    if (!currentRank) return;
    if (currentRank && currentRank.type !== 'sub') return Staff.checkTasks(client, member, ertu, options);

    const staffRecord = await StaffModel.findOne({ user: member.id });
    if (!staffRecord) return;

    const document = {
      ...staffRecord,
      totalPoints: staffRecord.totalPoints || 0,
      dailyPoints: staffRecord.dailyPoints || 0,
      publicPoints: staffRecord.publicPoints || 0,
      streamerPoints: staffRecord.streamerPoints || 0,
      activityPoints: staffRecord.activityPoints || 0,
      staffPoints: staffRecord.staffPoints || 0,
      taggedPoints: staffRecord.taggedPoints || 0,
      messagePoints: staffRecord.messagePoints || 0,
      registerPoints: staffRecord.registerPoints || 0,
      invitePoints: staffRecord.invitePoints || 0,
      afkPoints: staffRecord.afkPoints || 0,
    };

    if (currentRank && currentRank.type === 'sub' && options?.type) {

      const pointAddMap = {
        'staffPoints': 30,
        'taggedPoints': 30,
        'messagePoints': 1,
        'registerPoints': 30,
        'invitePoints': 30,
      };

      const responsbilitys = ertu?.staffResponsibilities?.filter((x) => member.roles.cache.has(x.role));
      const currentTaskResponsbility = responsbilitys ? responsbilitys?.find((x) => x.type === options.type) : undefined;

      const maxSleepPoint = document.totalPoints / 3;
      const pointToAdd = ['publicPoints', 'streamerPoints', 'activityPoints', 'afkPoints'].includes(options.type)
        ? options.point
        : ((pointAddMap[options.type] || options.amount) + (currentTaskResponsbility?.point || 0));

      document[options.type] += pointToAdd;
      document.totalPoints += pointToAdd;
      document.dailyPoints += pointToAdd;

      if (!currentRank || document.totalPoints < currentRank.point) {
        if (options.type === 'afkPoints' && document.afkPoints >= maxSleepPoint) return;

        await StaffModel.updateOne(
          { user: member.id },
          {
            $set: {
              totalPoints: document.totalPoints,
              dailyPoints: document.dailyPoints,
              [options.type]: document[options.type],
            },
            ...(options.type === 'invitePoints' && {
              $push: { inviteds: { user: options.user, date: new Date() } },
            }),
            ...(options.type === 'staffPoints' && {
              $push: { staffs: { user: options.user, date: new Date() } },
            }),
            ...(options.type === 'taggedPoints' && {
              $push: { taggeds: { user: options.user, date: new Date() } },
            }),
          }
        );
      };
    };

    if (!newRank || document.point < newRank.point) return;

    const now = Date.now();
    if (now - new Date(document.roleStartAt).getDate() >= 24 * 60 * 60 * 1000 * 7) return;

    await member.roles.add([newRank.role, ...newRank.hammers]);
    await member.roles.remove([currentRank.role, ...currentRank.hammers]);

    const logChannel = await client.getChannel('yetki-yükseltimleri', member);
    if (logChannel) logChannel.send({
      flags: [MessageFlags.SuppressNotifications],
      embeds: [
        new EmbedBuilder({
          title: 'Bilgilendirme',
          description: [
            `[${client.timestamp(Date.now())}] ${await client.getEmoji('up')} ${member} kişisi ${roleMention(currentRank.role)} rolünden ${roleMention(newRank.role)} rolüne başarılı bir şekilde yükseltildi.`,
            ' ',
            'Yetkili Bilgileri',
            `- **Yetkili Puanı**: ${document.totalPoints} / ${currentRank.point}`,
            `- **Yetki Başlangıç Tarihi**: ${client.timestamp(new Date(document.startAt))}`,
          ].join('\n'),
        })
      ]
    });

    await StaffModel.updateOne(
      { user: member.id },
      {
        $set: {
          roleStartAt: new Date(now),

          inviteds: [],
          tasks: [],
          staffs: [],
          bonuses: [],
          taggeds: [],

          totalGeneralMeeting: 0,
          totalIndividualMeeting: 0,
          totalStaffMeeting: 0,
          ticks: 0,
          taskName: '',

          dailyPoints: 0,
          bonusPoints: 0,
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
        },
        $push: {
          oldRanks: {
            roles: [newRank.role, ...newRank.hammers],
            date: now,
          },
        },
      }
    );
  }

  static async checkTasks(client, member, ertu, options = { type, amount, user }) {
    const document = await StaffModel.findOne({ user: member.id });
    if (!document) return;

    const mapType = {
      'staffPoints': 'STAFF',
      'taggedPoints': 'TAGGED',
      'messagePoints': 'MESSAGE',
      'registerPoints': 'REGISTER',
      'publicPoints': 'PUBLIC',
      'streamerPoints': 'STREAMER',
      'afkPoints': 'AFK',
    }
  
    const task = document.tasks.find((t) => t.type === mapType[options.type]);
    if (!task || task.completed) return;

    task.count += options.amount;
    task.completed = task.count >= task.required;

    document.markModified('tasks');
    await document.save();

    await StaffModel.updateOne( 
      { user: member.id },
      {
        ...(options.type === 'invitePoints' && {
          $push: { inviteds: { user: options.user, date: new Date() } },
        }),
        ...(options.type === 'staffPoints' && {
          $push: { staffs: { user: options.user, date: new Date() } },
        }),
        ...(options.type === 'taggedPoints' && {
          $push: { taggeds: { user: options.user, date: new Date() } },
        }),
      }
    );
  }
}