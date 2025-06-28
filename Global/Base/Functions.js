const { ButtonBuilder, ButtonStyle, ActionRowBuilder, time, Collection, inlineCode, ComponentType, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const limits = new Collection();
const { createWorker } = require('tesseract.js');
const { UserModel, SettingsModel } = require('../Settings/Schemas/');
const OneDay = 1000 * 60 * 60 * 24;

module.exports = class Functions {

    inviteRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/([a-zA-Z0-9\-]{2,32})\b/;

    static splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
        if (text.length <= maxLength) return [append + text + prepend];
        const splitText = text.split(char);
        const messages = [];
        let msg = '';
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk + append).length > maxLength) {
                messages.push(msg + append);
                msg = prepend;
            }
            msg += (msg && msg !== prepend ? char : '') + chunk;
        }

        return messages.concat(msg).filter((m) => m);
    }

    static timesUp() {
        return new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    custom_id: 'timeEnded',
                    label: 'Süre Doldu.',
                    emoji: '⏱️',
                    style: ButtonStyle.Danger,
                    disabled: true,
                }),
            ],
        })
    }

    static checkLimit(id, type, count = 5, minutes = 1000 * 60 * 15) {
        const now = Date.now();

        const userLimits = limits.get(`${id}-${type}`);
        if (!userLimits) {
            limits.set(`${id}-${type}`, { count: 1, lastUsage: now });
            return { hasLimit: false };
        }

        userLimits.count = userLimits.count + 1;
        const diff = now - userLimits.lastUsage;

        if (diff < minutes && userLimits.count >= count) {
            return {
                hasLimit: true,
                time: time(Math.floor((userLimits.lastUsage + minutes) / 1000), 'R'),
                delete: userLimits.lastUsage + minutes
            };
        }

        if (diff > minutes) limits.delete(id);
        else limits.set(id, userLimits);
        return { hasLimit: false };
    }

    static chunkArray(array, chunkSize) {
        const temp = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            temp.push(array.slice(i, i + chunkSize));
        }
        return temp;
    };

    static date(date) {
        return new Date(date).toLocaleString('tr-TR', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    static checkUser(message, member) {
        let type;

        if (member.user.bot) type = 'Botlara işlem yapamazsın!';
        if (member.id === message.member?.id) type = 'Kendinize işlem yapamazsın!';
        if (message.member?.roles.highest.id === member.roles.highest.id) type = `${member} ile aynı yetkidesin! Kullanıcıya işlem yapamazsın.`;
        if (member.roles.highest.rawPosition >= message.member?.roles.highest.rawPosition) type = `${member} senden daha üst bir yetkiye sahip.`;
        if (message.guild?.members.me?.roles.highest.id === member.roles.highest.id) type = `${member} benimle aynı yetkiye sahip! Kullanıcıya işlem yapamam.`;
        if (type) message.reply(type);
        return type;
    }

    static async controlImage(url) {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(url);
        const texts = ret.data.text.split('\n').filter((text) => text.length > 0);
        const check = texts.find((text) => text.toLowerCase().includes('discord'));
        if (check) {
            await worker.terminate();
            return check;
        } else {
            await worker.terminate();
            return false;
        }
    };

    static getImage(str) {
        const images = str.match(/((?:https?:\/\/)[a-z0-9]+(?:[-.][a-z0-9]+)*\.[a-z]{2,5}(?::[0-9]{1,5})?(?:\/[^ \n<>]*)\.(?:png|apng|jpg|gif))/g);
        return images ? images[0] : undefined;
    };

    static async addStat({ type, member, channel, message, value }) {
        const now = new Date();
        let document = await UserModel.findOne({ id: member.id });
        if (!document) {
            document = new UserModel({ id: member.id });
            await document.save();
        }
        if (!document.lastSeen) document.lastSeen = {};
        if (type === 'message') {
            document.lastSeen.message = now;
            document.markModified('lastSeen');
            await document.save();
        }
        if (type === 'voice') {
            document.lastSeen.voice = now;
            document.markModified('lastSeen');
            await document.save();
        }
    }

    static getChannels(guild, document, days, day) {
        const channelStats = {};
        let total = 0;
        Object.keys(days)
            .filter((d) => day > document.day - Number(d))
            .forEach((d) =>
                Object.keys(days[d]).forEach((channelId) => {
                    const channel = guild.channels.cache.get(channelId);
                    if (!channel) return;

                    if (!channelStats[channelId]) channelStats[channelId] = 0;
                    channelStats[channelId] += days[d][channelId];
                    total += days[d][channelId];
                }),
            );

        return {
            channels: Object.keys(channelStats)
                .sort((a, b) => channelStats[b] - channelStats[a])
                .map((c) => ({ id: c, value: channelStats[c] }))
                .slice(0, 10),
            total,
        };
    };

    static getCategory(guild, document, days, day) {
        const channelStats = {};
        let total = 0;
        Object.keys(days)
            .filter((d) => day > document.day - Number(d))
            .forEach((d) =>
                Object.keys(days[d]).forEach((channelId) => {
                    const channel = guild.channels.cache.get(channelId);
                    if (!channel || !channel.parentId) return;

                    if (!channelStats[channel.parentId]) channelStats[channel.parentId] = 0;
                    channelStats[channel.parentId] += days[d][channel.id];
                    total += days[d][channel.id];
                }),
            );

        return {
            categories: Object.keys(channelStats)
                .sort((a, b) => channelStats[b] - channelStats[a])
                .map((c) => ({ id: c, value: channelStats[c] }))
                .slice(0, 10),
            total,
        };
    };

    static formatDurations(ms) {
        const seconds = Math.floor(ms / 1000) % 60; 
        const minutes = Math.floor(ms / (1000 * 60)) % 60; 
        const hours = Math.floor(ms / (1000 * 60 * 60)); 

        const parts = [];
        if (hours > 0) parts.push(`${hours} saat`);
        if (minutes > 0) parts.push(`${minutes} dakika`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds} saniye`);

        return parts.join(' ');
    }

    static shortNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'Mr';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else {
            return num.toString();
        }
    };

    static async getPageData(currentPage, guildMembers, totalQuery) {
        return await UserModel.aggregate([
            {
                $project: {
                    id: '$id',
                    total: totalQuery
                }
            },
            {
                $match: {
                    id: { $in: guildMembers },
                    total: { $gt: 0 }
                }
            },
            {
                $sort: {
                    total: -1
                }
            },
            {
                $skip: (currentPage - 1) * 10
            },
            {
                $limit: 10
            }
        ]);
    }

    static async pageEmbed(client, guild, type, datas, page) {
        const specials = {
            1: '🏆',
            2: '🥈',
            3: '🥉'
        };

        const topTitle = {
            messages: 'Mesaj Sıralaması',
            voices: 'Ses Sıralaması',
            streams: 'Yayın Sıralaması',
            cameras: 'Kamera Sıralaması',
            invites: 'Davet Sıralaması',
            register: 'Kayıt Sıralaması',
            staff: 'Yetkili Sıralaması',
        };

        return new EmbedBuilder({
            color: client.getColor('random'),
            footer: { text: 'ertu was here ❤️' },
            title: topTitle[type],
            thumbnail: {
                url: guild.iconURL({ size: 2048 }) || ''
            },

            description: [
                ...datas.map((data, index) => {
                    const user = guild.members.cache.get(data.id);
                    if (!user) return;
                    const valueString = ['messages', 'invites', 'register', 'staff'].includes(type) ? `${data.total || 0} ${type === 'messages' ? 'mesaj' : type === 'invites' ? 'davet' : type === 'register' ? 'kayıt' : 'yetkili'}` : client.functions.formatDurations(data.total);
                    return `${inlineCode(` ${specials[this.shortNumber(index + (page - 1) * 10 + 1)] || `${index + (page - 1) * 10 + 1}.`} `)} ${user || user.displayName} - ${valueString}`;
                })
            ].join('\n'),
        })
    }

    static async pagination(client, message, type, id) {
        const guildMembers = message.guild.members.cache.filter((member) => !member.user.bot).map((member) => member.id);

        const totalQuery = type === 'invites' ? { $size: '$invites' } :
            type === 'staff' ? { $size: '$staffs' } :
                type === 'register' ? { $size: '$records' } :
                    {
                        $reduce: {
                            input: { $objectToArray: `$${type}` },
                            initialValue: 0,
                            in: {
                                $add: ['$$value', { $toDouble: '$$this.v.total' }]
                            }
                        }
                    };

        const validRecordsCount = await UserModel.aggregate([
            {
                $project: {
                    id: '$id',
                    total: totalQuery
                }
            },
            {
                $match: {
                    id: { $in: guildMembers },
                    total: { $gt: 0 }
                }
            },
            {
                $count: 'total'
            }
        ]).then(result => result[0]?.total || 0);

        const totalData = Math.ceil(validRecordsCount / 10);
        let page = 1;

        const initialData = await this.getPageData(page, guildMembers, totalQuery);
        await message.edit({
            embeds: [await this.pageEmbed(client, message.guild, type, initialData, page)],
            components: [client.getButton(page, totalData || 1)]
        });

        const filter = (i) => i.user.id === id;
        const collector = await message.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * 2,
            max: 20,
            componentType: ComponentType.Button
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId === 'first') page = 1;
            else if (i.customId === 'previous') page = Math.max(1, page - 1);
            else if (i.customId === 'next') page = Math.min(totalData, page + 1);
            else if (i.customId === 'last') page = totalData;

            const newData = await this.getPageData(page, guildMembers, totalQuery);
            await message.edit({
                embeds: [await this.pageEmbed(client, message.guild, type, newData, page)],
                components: [client.getButton(page, totalData || 1)]
            });
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') message.edit({
                embeds: [await this.pageEmbed(client, message.guild, type, initialData, page)],
                components: [client.functions.timesUp()]
            });
        });
    }

    static control(item) {
        if (typeof item === 'string' && item.length > 0) {
            return true;
        };

        if (Array.isArray(item) && item.length) {
            return true;
        };

        if (typeof item === 'number' && item > 0) {
            return true;
        }

        return false;
    };

    static async speedTest(url) {
        return axios.get(url).then(async (response) => {
            const match = response.data.match(/window\.OOKLA\.INIT_DATA\s*=\s*(\{.*?\});/);
            if (!match) return null;
            const result = JSON.parse(match[1]).result;

            return {
                download: result.download ? String(result.download).slice(0, -3) : null,
                upload: result.upload ? String(result.upload).slice(0, -3) : null
            }

        }).catch((error) => {
            console.error(error);
            return null;
        });
    }

    static titleCase(str) {
        return str
            .split(' ')
            .map((arg) => arg.charAt(0).toLocaleUpperCase('tr-TR') + arg.slice(1))
            .join(' ');
    }

    static async createBar(client, current, required) {
        const percentage = Math.min((100 * current) / required, 100);
        const progress = Math.max(Math.round((percentage / 100) * 4), 0);

        const getEmojiSafe = async (name) => {
            const emoji = await client.getEmoji(name);
            return typeof emoji === 'object' && emoji?.toString() ? emoji.toString() : '';
        };

        let str = await getEmojiSafe(percentage > 0 ? 'Start' : 'EmptyStart');
        str += (await getEmojiSafe('Mid')).repeat(progress);
        str += (await getEmojiSafe('EmptyMid')).repeat(4 - progress);
        str += await getEmojiSafe(percentage === 100 ? 'End' : 'EmptyEnd');
        return str;
    }

    static getRandomColor() {
        const letters = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    static formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    static async updateStats(type, value, guild) {
        const document = await SettingsModel.findOne({ id: guild.id });
        if (!document) return;

        if (type === 'message') {
            await SettingsModel.updateOne({ id: guild.id }, {
                $inc: {
                    stats: {
                        daily: {
                            messages: value
                        },

                        weekly: {
                            messages: value
                        },

                        monthly: {
                            messages: value
                        }
                    }
                }
            });
        }

        if (type === 'voice') {
            await SettingsModel.updateOne({ id: guild.id }, {
                $inc: {
                    stats: {
                        daily: {
                            voices: value
                        },

                        weekly: {
                            voices: value
                        },

                        monthly: {
                            voices: value
                        }
                    }
                }
            });
        }
    }

    static async calculateWrongPunitivies(member) {
        const document = await UserModel.findOne({ id: member.id });
        if (!document) return;

        await UserModel.updateOne({ id: member.id }, { $inc: { wrongPunitives: 1 } }, { upsert: true });

        if (document.wrongPunitives >= 5) {
            await member.send({ content: '5 kez hatalı ceza verdiğiniz için komut cezası yediniz!' }).catch(() => { });
            await UserModel.updateOne({ id: member.id }, { $set: { wrongPunitives: 0 } }, { upsert: true });
            await SettingsModel.updateOne({ id: member.guild.id }, { $push: { cmdPenalties: { id: member.id, removeTime: Date.now() + 259200000 } } }, { upsert: true });
        };
    }
}