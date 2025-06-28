const { schedule } = require('node-cron');
const { SettingsModel, UserModel } = require('../../Settings/Schemas');
const { EmbedBuilder, bold } = require('discord.js');

module.exports = async function LeaderBoard(client, guild, ertu) {
  schedule('* * * * *', async () => {

    const document = await SettingsModel.findOne({ id: guild.id });
    if (!document) return;

    const channel = guild.channels.cache.get(document.board.channel);
    if (!channel) return;

    const messageBoard = await channel.messages.fetch(document.board.msg);
    const guildMembers = guild.members.cache.map(member => member.user.id);
    if (!messageBoard) return await SettingsModel.findOneAndUpdate({ id: guild.id }, { $set: { board: {} } });

    const Message = await UserModel.aggregate([
      { $project: { id: '$id', total: { $reduce: { input: { $objectToArray: `$messages` }, initialValue: 0, in: { $add: ['$$value', '$$this.v.total'] } } } } },
      { $match: { id: { $in: guildMembers }, total: { $gt: 0 } } },
      { $sort: { total: -1 } },
      { $skip: 0 },
      { $limit: 3 },
      { $project: { id: 1, total: 1 } },
    ]);

    const Voice = await UserModel.aggregate([
      { $project: { id: '$id', total: { $reduce: { input: { $objectToArray: `$voices` }, initialValue: 0, in: { $add: ['$$value', '$$this.v.total'] } } } } },
      { $match: { id: { $in: guildMembers }, total: { $gt: 0 } } },
      { $sort: { total: -1 } },
      { $skip: 0 },
      { $limit: 3 },
      { $project: { id: 1, total: 1 } },
    ]);

    const Stream = await UserModel.aggregate([
      { $project: { id: '$id', total: { $reduce: { input: { $objectToArray: `$streams` }, initialValue: 0, in: { $add: ['$$value', '$$this.v.total'] } } } } },
      { $match: { id: { $in: guildMembers }, total: { $gt: 0 } } },
      { $sort: { total: -1 } },
      { $skip: 0 },
      { $limit: 3 },
      { $project: { id: 1, total: 1 } },
    ]);

    const Camera = await UserModel.aggregate([
      { $project: { id: '$id', total: { $reduce: { input: { $objectToArray: `$cameras` }, initialValue: 0, in: { $add: ['$$value', '$$this.v.total'] } } } } },
      { $match: { id: { $in: guildMembers }, total: { $gt: 0 } } },
      { $sort: { total: -1 } },
      { $skip: 0 },
      { $limit: 3 },
      { $project: { id: 1, total: 1 } },
    ]);

    const MessageArray = [];
    const VoiceArray = [];
    const StreamArray = [];
    const CameraArray = [];

    Message.forEach((data, index) => {
      MessageArray.push({ id: data.id, total: data.total, i: index + 1 });
    });

    Voice.forEach((data, index) => {
      VoiceArray.push({ id: data.id, total: data.total, i: index + 1 });
    });

    Stream.forEach((data, index) => {
      StreamArray.push({ id: data.id, total: data.total, i: index + 1 });
    });

    Camera.forEach((data, index) => {
      CameraArray.push({ id: data.id, total: data.total, i: index + 1 });
    });

    const embed = new EmbedBuilder({
      color: client.getColor('random'),
      description: [
        `${await client.getEmoji('point')} ${bold(`Aşağıda ${guild.name} sunucusunun sıralama tablosu listelenmektedir.`)}\n`,
        `${await client.getEmoji('point')} **Ses Sıralaması:**\n${VoiceArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${client.functions.formatDurations(data.total)}`).join('\n')}\n`,
        `${await client.getEmoji('point')} **Mesaj Sıralaması:**\n${MessageArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${data.total} mesaj`).join('\n')}\n`,
        `${await client.getEmoji('point')} **Yayın Sıralaması:**\n${StreamArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${client.functions.formatDurations(data.total)}`).join('\n')}\n`,
        `${await client.getEmoji('point')} **Kamera Sıralaması:**\n${CameraArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${client.functions.formatDurations(data.total)}`).join('\n')}\n`,
        `${await client.getEmoji('point')} **Sıralama Tablosu Saatlik Güncellenmektedir.**`,
      ].join('\n'),
    })

    try {
      messageBoard.edit({ embeds: [embed] })
    } catch (e) {
      console.error(e)
    }
  })
}