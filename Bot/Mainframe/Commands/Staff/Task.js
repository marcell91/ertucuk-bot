const { EmbedBuilder, inlineCode, codeBlock } = require('discord.js');
const { StaffModel } = require('../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'görev',
  Aliases: ['g', 'task', 'görevlerim'],
  Description: 'Sunucuda ki yetkililerin görevlerini gösterir.',
  Usage: 'görev',
  Category: 'General',
  Cooldown: 0,

  Permissions: {
    User: [],
    Role: [],
  },

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args, ertu, embed) => {

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    if (!member) return message.channel.send({ content: `Kullanıcı bulunamadı!` });

    if (!client.staff.check(member, ertu)) {
      message.channel.send({ content: `${member.id === message.author.id ? 'Yetkili değilsiniz.' : 'Belirttiğin kullanıcı yetkili değil!'}` });
      return;
    }

    const document = await StaffModel.findOne({ user: member.id });
    if (!document) {
      message.channel.send({ content: 'Belirttiğin kullanıcı veritabanında bulunamadı!' });
      return;
    }

    const { currentRank } = client.staff.getRank(member, ertu);
    if (!currentRank) {
      message.channel.send({ content: 'Belirttiğin kullanıcı yetkili değil!' });
      return;
    }

    if (currentRank.type == 'sub') {
      message.channel.send({ content: `${message.author.id === member.id ? 'Alt yetkili olduğunuz için bu komutu kullanamazsınız.' : 'Belirttiğin kullanıcı alt yetkili olduğu için bu komutu kullanamazsınız!'}` });
      return
    }


    if (!document.tasks.length) {
      message.reply({ content: `${await client.getEmoji('mark')} Göreviniz bulunmamaktadır. Görev seçme kanalından görev seçebilirsiniz.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    const illusion = new EmbedBuilder({
      timestamp: new Date(),
      author: { name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) },
      footer: { text: `ertu was here ❤️`, iconURL: member.guild.iconURL({ dynamic: true }) },
      description: [
        `${member} kullanıcısının görevleri aşağıda belirtilmiştir.\n`,
        `${codeBlock('yaml', `Genel Bilgiler;`)}`,
        `${await client.getEmoji('point')} ${inlineCode(` Roldeki Süre  :`)} ${client.timestamp(document.roleStartAt)}`,
        `${await client.getEmoji('point')} ${inlineCode(` Seçim Tarihi  :`)} ${client.timestamp(document.taskStartAt)}`,
        `${await client.getEmoji('point')} ${inlineCode(` İlerleme      :`)} ${await client.functions.createBar(client, calculatePercantage(document), 100)} (%${calculatePercantage(document)})`,
        `${await client.getEmoji('point')} ${inlineCode(` Görev         :`)} ${document.taskName} Görevi`,
        `${await client.getEmoji('point')} ${inlineCode(` Tik Durumu    :`)} ${Array(document.ticks).fill(`${await client.getEmoji('check')}`).join('')}`,
        '',
        `${codeBlock('yaml', `Görevler;`)}`,
        `${(await Promise.all(document.tasks.map(async t => `${await client.getEmoji('point')} ${inlineCode(t.name.padEnd(20, ' ') + ':')} ${await control(client, t)}`))).join('\n')}`,
      ].join('\n'),
    });

    message.channel.send({ embeds: [illusion] });

  },
};

function calculatePercantage(document) {
  let total = 0;
  let count = 0;

  document.tasks.forEach((task) => {
    total += (task.count >= task.required ? task.required : task.count) / task.required * 100
    count++;
  });

  return Math.floor(total / count);
}

async function control(client, taskData) {
  const { count, required, type } = taskData;
  const currentData = ['AFK', 'STREAMER', 'PUBLIC'].includes(type) ? formatDurations(count) : count;
  const requiredData = ['AFK', 'STREAMER', 'PUBLIC'].includes(type) ? formatDurations(required) + ' saat' : required + ' adet';

  if (count >= required) {
    return `${await client.functions.createBar(client, count, required)} ${await client.getEmoji('check')}`
  }

  return `${await client.functions.createBar(client, count, required)} (${inlineCode(`${currentData}/${requiredData}`)})`
}

function formatDurations(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  let result = '';
  if (hours > 0) result += `${hours} saat`;
  if (minutes > 0) result += `${result ? ' ' : ''}${minutes} dakika`;
  if (!result) result = '0 dakika';
  return result;
}