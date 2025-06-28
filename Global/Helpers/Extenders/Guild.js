const {
  Guild,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { SettingsModel } = require('../../Settings/Schemas');

const HelpTitle = {
  advanced: 'Yetkili Komutları',
  moderation: 'Moderasyon Komutları',
  register: 'Kayıt Komutları',
  staff: 'Görev Komutları',
  founder: 'Kurucu Komutları',
};

module.exports = Object.defineProperties(Guild.prototype, {
  fetchSettings: {
    value: async function () {
      return (this.find = await SettingsModel.findOneAndUpdate(
        { id: this.id },
        {},
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ));
    },
  },

  set: {
    value: async function (settings) {
      try {
        logger.log(
          `Guild: [${this.id}] updated settings: ${Object.keys(settings)}`
        );
        if (Object.keys(this.settings).length > 0) {
          await SettingsModel.findOneAndUpdate(
            { id: this.id },
            { $set: settings }
          );
        } else {
          const newGuild = new SettingsModel(
            Object.assign({ id: this.id }, { $set: settings })
          );
          await newGuild.save();
        }

        return this.fetchSettings();
      } catch (error) {
        logger.error(
          `Failed to update settings for Guild: [${this.id}]. Error: ${error}`
        );
      }
    },
  },

  getSettings: {
    value: async function () {
      let document = await SettingsModel.findOne({ id: this.id });

      if (!document) document = await new SettingsModel({ id: this.id }).save();

      const documentObject = document.toObject();

      const { $setOnInsert, _id, __v, ...cleanObject } = documentObject;

      this.settings = cleanObject;
      return document;
    },
  },

  updateSettings: {
    value: async function (update, options) {
      await SettingsModel.updateOne({ id: this.id }, update, {
        upsert: true,
        ...options,
      });
      this.getSettings();
    },
  },

  getRows: {
    value: async function (type) {
      await this.getSettings();

      const rows = [
        new ActionRowBuilder({
          components: [
            new ButtonBuilder({
              custom_id: 'setup:main',
              label: 'Genel Ayarlar',
              style: ButtonStyle.Secondary,
            }),

            new ButtonBuilder({
              custom_id: 'setup:second',
              label: 'Moderasyon / Limitler',
              style: ButtonStyle.Secondary,
            }),
          ],
        }),
      ];

      if (type === 'main') {
        rows[0].components[0].setDisabled(true);

        rows.push(
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: 'setup:systems',
                placeholder: 'Sunucunun Sistemleri',
                options: this.client.server.Systems.map((d) => ({
                  label: d.name,
                  description: d.description,
                  value: d.value,
                  emoji: {
                    id: this.client.functions.control(
                      getNested(this.settings, d.root) ? getNested(this.settings, d.root)[d.value] : undefined
                    )
                      ? '1292054202499076117'
                      : '1292054129207808093',
                  },
                })),
              }),
            ],
          })
        );

        rows.push(
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: 'setup:general',
                placeholder: 'Sunucunun Genel Ayarları',
                options: this.client.server.General.map((d) => ({
                  label: d.name,
                  description: d.description,
                  value: d.value,
                  emoji: {
                    id: this.client.functions.control(
                      getNested(this.settings, d.root) ? getNested(this.settings, d.root)[d.value] : undefined
                    )
                      ? '1292054202499076117'
                      : '1292054129207808093',
                  },
                })),
              }),
            ],
          })
        );

        rows.push(
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: 'setup:roles',
                placeholder: 'Sunucunun Rol Ayarları',
                options: this.client.server.Roles.map((d) => ({
                  label: d.name,
                  description: d.description,
                  value: d.value,
                  emoji: {
                    id: this.client.functions.control(
                      getNested(this.settings, d.root) ? getNested(this.settings, d.root)[d.value] : undefined
                    )
                      ? '1292054202499076117'
                      : '1292054129207808093',
                  },
                })),
              }),
            ],
          })
        );

        rows.push(
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: 'setup:channels',
                placeholder: 'Sunucunun Kanal Ayarları',
                options: this.client.server.Channels.map((d) => ({
                  label: d.name,
                  description: d.description,
                  value: d.value,
                  emoji: {
                    id: this.client.functions.control(
                      getNested(this.settings, d.root) ? getNested(this.settings, d.root)[d.value] : undefined
                    )
                      ? '1292054202499076117'
                      : '1292054129207808093',
                  },
                })),
              }),
            ],
          })
        );
      } else {
        rows[0].components[1].setDisabled(true);

        rows.push(
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: 'setup:moderation',
                placeholder: 'Sunucunun Moderasyon Ayarları',
                options: this.client.server.Moderation.map((d) => ({
                  label: d.name,
                  description: d.description,
                  value: d.value,
                  emoji: {
                    id: this.client.functions.control(
                      getNested(this.settings, d.root) ? getNested(this.settings, d.root)[d.value] : undefined
                    )
                      ? '1292054202499076117'
                      : '1292054129207808093',
                  },
                })),
              }),
            ],
          })
        );

        rows.push(
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: 'setup:limit',
                placeholder: 'Sunucunun Limit Ayarları',
                options: this.client.server.Limit.map((d) => ({
                  label: d.name,
                  description: d.description,
                  value: d.value,
                  emoji: {
                    id: this.client.functions.control(
                      getNested(this.settings, d.root) ? getNested(this.settings, d.root)[`${d.value}Limit`] : undefined
                    )
                      ? '1292054202499076117'
                      : '1292054129207808093',
                  },
                })),
              }),
            ],
          })
        );

        rows.push(
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: 'canexecute:folder',
                placeholder: 'Sunucunun Komut Ayarları',
                options: [
                  ...Object.keys(HelpTitle).map((c) => ({
                    label: HelpTitle[c],
                    value: 'canexecute:' + c,
                  })),
                ],
              }),
            ],
          })
        );
      }

      return rows;
    },
  },

  updateRooms: {
    value: function () {
      setInterval(async () => {
        const document = await SettingsModel.findOne({ id: this.id });
        if (!document || !document.privateRooms) return;

        document.privateRooms.forEach((pr) => {
          const last = pr.last;
          if (isNaN(last)) return;

          const channel = this.channels.cache.get(pr.channel);
          if (!channel) return;

          if (channel.members.has(pr.owner)) return;

          if (pr.last && Date.now() - pr.last > 10000) {
            channel.delete().catch(() => null);
            this.updateSettings({
              $pull: { privateRooms: { channel: pr.channel } },
            });
          }
        });
      }, 10000);
    },
  },

  watcher: {
    value: async function () {
      return setInterval(async () => {
        await this.getSettings();
      }, 10000);
    },
  },

  deleteDB: {
    value: async function () {
      return await SettingsModel.deleteOne({ id: this.id });
    },
  },

  settings: {
    value: {},
    writable: true,
  },

  stats: {
    value: [],
    writable: true,
  },

  getMember: {
    value: function (memberKey) {
      return (
        this.members.cache.find((m) => m.user.username === memberKey) ||
        this.members.cache.find((m) => m.id === getSnowflake(memberKey)) ||
        null
      );
    },
  },
});

function getSnowflake(key) {
  const match = key?.match(/<@(\d+)>/);
  return match ? match[1] : key;
}

function getNested(obj, path) {
  return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
}
