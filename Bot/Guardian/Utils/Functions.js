const { PermissionFlagsBits, PermissionsBitField, ChannelType, Client, GatewayIntentBits, Partials, Collection, GuildPremiumTier } = require('discord.js');

const { serverID, ownerID, Security } = require('../../../Global/Settings/System');
const { curses } = require('../../../Global/Settings/Server/Data');
const { SettingsModel, RoleModel, ChannelModel, ExpressionModel } = require('../../../Global/Settings/Schemas');

const limits = new Collection()
const voiceBitrates = {
	[GuildPremiumTier.None]: 64000,
	[GuildPremiumTier.Tier1]: 128000,
	[GuildPremiumTier.Tier2]: 256000,
	[GuildPremiumTier.Tier3]: 384000,
};

function date(date) {
	return new Date(date).toLocaleString('tr-TR', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric',
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
	});
};

async function startDists(tokens) {
	const bots = [];
	for (const token of tokens) {
		bots.push(
			new Promise((resolve) => {
				const distClient = new Client({
					intents: Object.keys(GatewayIntentBits),
					partials: Object.keys(Partials),
					presence: { status: 'invisible' },
				});

				distClient.on('ready', () => {
					const guild = distClient.guilds.cache.get(serverID);
					if (!guild) {
						console.log(`[DISTS]: ${distClient.user.username} is not in server!`);
						distClient.destroy();
						return;
					}

					resolve(distClient);
				});

				distClient.on('rateLimit', (rateLimitData) => {
					console.log(
						`[DISTS]: ${distClient.user.username} rate limited caught. Retrying in ${Math.round(
							rateLimitData.timeout / 1000,
						)} seconds.`,
					);
				});

				distClient.login(token).then(() => console.log(`[DISTS]: ${distClient.user.username} is online.`)).catch(() => console.log(`[DISTS]: ${token} is not online.`));
			}),
		);
	}

	return Promise.all(bots);
}

async function channelBackup(guild) {
	guild.channels.cache.forEach(async (channel) => {

		const messages = [];
		let fetchComplete = false;
		let lastMessageId;
		var fetchOptions = { limit: 35 };

		if (channel.isTextBased()) {
			while (!fetchComplete) {
				if (lastMessageId) {
					fetchOptions.before = lastMessageId;
				}
				var fetchedMessages = await channel.messages.fetch(fetchOptions);
				if (fetchedMessages.size === 0) {
					fetchComplete = true;
					break;
				}

				lastMessageId = fetchedMessages.last()?.id;
				for (var message of [...fetchedMessages.values()]) {
					messages.push({
						content: message.content,
						username: message.author.displayName,
						avatarURL: message.author.displayAvatarURL(),
						pinned: message.pinned,
						embeds: message.embeds,
						files: await Promise.all(
							message.attachments.map(async (attachment) => {
								let attach = attachment.url;
								if (attachment.url && ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi'].includes(attachment.url)) {
									attach = await axios.get(attachment.url, { responseType: 'arraybuffer' }).then((response) => {
										return `data:${response.headers['content-type']};base64,${Buffer.from(response.data).toString('base64')}`;
									}).catch(() => { return attachment.url; });
								};
								return {
									name: attachment.name,
									attachment: attach,
								};
							}),
						),
					});
				}
			};
		};

		await ChannelModel.findOneAndUpdate(
			{ id: serverID, channel: channel?.id },
			{
				$set: {
					id: serverID,
					channel: channel?.id,
					isDeleted: false,
					deletedTimestamp: undefined,
					name: channel?.name,
					type: channel?.type,
					topic: channel?.topic,
					position: channel?.position,
					nsfw: channel?.nsfw,
					messages: messages,
					bitrate: channel?.bitrate,
					userLimit: channel?.userLimit,
					rateLimitPerUser: channel?.rateLimitPerUser || 0,
					parentId: channel?.parent?.id,
					permissionOverwrites: channel.permissionOverwrites.cache.map((perm) => ({
						id: perm.id,
						type: perm.type,
						allow: new PermissionsBitField(perm.allow).toArray(),
						deny: new PermissionsBitField(perm.deny).toArray()
					})),
				}
			},
			{ upsert: true, new: true },
		).catch((err) => console.log(err));
	});
}

async function expressionBackup(guild) {
	guild.emojis.cache.forEach(async (emoji) => {
		await ExpressionModel.findOneAndUpdate(
			{ id: serverID, expression: emoji.id },
			{
				$set: {
					id: serverID,
					expression: emoji.id,
					name: emoji.name,
					url: emoji.url,
					animated: emoji.animated ? true : false
				}
			},
			{ upsert: true }
		).catch((err) => { });
	});

	guild.stickers.cache.forEach(async (sticker) => {
		await ExpressionModel.findOneAndUpdate(
			{ id: serverID, expression: sticker.id },
			{
				$set: {
					id: serverID,
					expression: sticker.id,
					name: sticker.name,
					url: sticker.url,
					description: sticker.description,
					tags: sticker.tags,
					animated: sticker.format === '4' ? true : false
				}
			},
			{ upsert: true, new: true },
		).catch((err) => console.log(err));
	});
}

async function roleBackup(guild) {
	guild.roles.cache.forEach(async (role) => {
		let rolePerms = [];
		role.guild.channels.cache
			.filter((e) => e?.permissionOverwrites?.cache.has(role.id))
			.forEach((x) => {
				let channelPerm = x?.permissionOverwrites?.cache.get(role.id);
				rolePerms.push({ id: x.id, allow: channelPerm.allow.toArray(), deny: channelPerm.deny.toArray() });
			});
		await RoleModel.findOneAndUpdate(
			{ id: serverID, role: role?.id },
			{
				$set: {
					id: serverID,
					role: role?.id,
					isDeleted: false,
					deletedTimestamp: undefined,
					name: role?.name,
					icon: role?.iconURL(),
					color: role?.hexColor,
					hoist: role?.hoist,
					position: role?.position,
					permissions: role?.permissions.bitfield.toString(),
					mentionable: role?.mentionable,
					members: role?.members.map((x) => x.id),
					channelOverwrites: rolePerms
				}
			},
			{ upsert: true, new: true },
		).catch((err) => console.log(err));
	});
}

let perms = [PermissionFlagsBits.Administrator, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageWebhooks, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageGuild, PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers];

async function punish(client, member, type, reason, action) {
	const guild = client.guilds.cache.get(serverID);
	if (!guild) return console.log('Sunucu Bulunamadı!');

	switch (type) {
		case 1:
			member.guild.bans.create(member.id, { reason: 'ertu Security - ' + reason }).catch(() => { });
			break;

		case 2:
			member.kick('ertu Security - ' + reason).catch(() => { });
			break;

		case 3:
			if (!member) return;
			member.roles.remove(member.roles.cache.filter((x) => x.editable && x.name !== '@everyone' && perms.some((perm) => x.permissions.has(perm))).map((x) => x.id)).catch(() => { });
			break;
	};

	const dangerRoles = guild.roles.cache.filter((r) => perms.some((perm) => r.permissions.has(perm)) && r.editable);
	const data = [];

	if (action !== 'close') return;

	for (const r of dangerRoles.values()) {
		data.push({  
			role: r.id,
			permissions: new PermissionsBitField(r.permissions.bitfield),
		})

		await r.setPermissions(PermissionsBitField.Flags.SendMessages).catch((err) => { console.log(err) });
		await SettingsModel.updateOne(
			{ id: guild.id },
			{ $push: { 'security.rolePermissions': data } },
			{ upsert: true }
		);
	}
}

async function checkWhitelist(client, member, type) {

	const guild = client.guilds.cache.get(serverID);
	if (!guild) return false;

	const document = await SettingsModel.findOne({ id: guild.id }).catch((err) => { });
	if (!document) return false;

	const whitelists = document.security.whitelist.filter(w =>
		w.key === member.id || member.roles.cache.some(r => r.id === w.key)
	);

	if (!member) return false;

	const guildOwner = member.id === member.guild.ownerId;
	const developers = ownerID.includes(member.id);
	const bots = Security.BotsIDs.includes(member.id);

	if (whitelists.length === 0 && !guildOwner && !developers && !bots) return false;

	const relevantAccess = whitelists.flatMap(w => w.access).filter(a => a.type === type || a.type === 'full');

	if (relevantAccess.length === 0 && !guildOwner && !developers && !bots) return false;

	const fullAccess = relevantAccess.some(a => a.type === 'full');
	const lowestLimit = Math.min(...relevantAccess.map(a => a.limit));
	const lowestPunish = Math.min(...relevantAccess.map(a => a.punish));

	const operationPunish = whitelists.find(w => w.access.some((a) => a.type === type))?.access.find((a) => a.type === type)?.punish;
	const fullPunish = whitelists.find(w => w.access.some((a) => a.type === 'full'))?.access.find((a) => a.type === 'full')?.punish;
	const punishType = operationPunish || fullPunish || 3;

	const whitelistType = guildOwner ? '👑 Taç Sahibi ' : fullAccess ? '🟢 Full Erişim' : developers ? `👑 Developer` : bots ? `🤖 ertu Bots` : `🟢 Güvenli Listede`
	const limit = guildOwner ? 0 : developers ? 0 : bots ? 0 : lowestLimit;
	const limitType = limit === 0 ? 'Sınırsız' : 'Limitli';
	const dontPunish = limit === 0;

	const now = Date.now();
	const content = `${date(now)} -> ${type}`;
	const key = `${member.id}_${type}`;
	const userLimits = limits.get(key) || { operations: [], lastDate: now };

	userLimits.operations.push(content);
	const diff = now - userLimits.lastDate;

	const timeLimit = 86400000;
	const countLimit = limit === 0 ? Number.MAX_SAFE_INTEGER : limit || 3;

	const currentUserLimit = userLimits.operations.length;
	const maxUserLimit = countLimit;
	const limitRatio = limitType === 'Sınırsız'
		? 'Sınırsız'
		: currentUserLimit > maxUserLimit
			? 'Limit Aşıldı'
			: `${currentUserLimit}/${maxUserLimit}`;

	if (diff < timeLimit && userLimits.operations.length > countLimit && !guildOwner && !developers && !bots) {
		return {
			isWarn: false,
			maxCount: countLimit,
			currentCount: userLimits.operations.length,
			operations: userLimits.operations,
			punish: lowestPunish,
			whitelistType,
			limitType,
			dontPunish,
			limitRatio,
			punishType,
		};
	}

	if (diff > timeLimit) {
		limits.set(key, { operations: [content], lastDate: now });
	} else {
		limits.set(key, userLimits);
	}

	return {
		isWarn: true,
		maxCount: countLimit,
		currentCount: userLimits.operations.length,
		operations: userLimits.operations,
		whitelistType,
		limitType,
		dontPunish,
		limitRatio,
		punishType,
	};
}

async function checkRoles(guild, data) {
	const returnData = { add: [], remove: [] };

	data.forEach(function (rolesData) {
		const type = rolesData.key;
		const filteredData = rolesData.data.filter(function (roleD) {
			const role = guild.roles.cache.get(roleD.id);
			return perms.some(perm => role.permissions.has(perm));
		});

		returnData[type] = filteredData;
	});

	return returnData;
};

async function createRole(client, document) {

	const guild = client.guilds.cache.get(serverID);
	if (!guild) return;

	const role = await guild.roles.create({
		name: document.name,
		color: document.color,
		permissions: document.permissions,
		hoist: document.hoist,
		mentionable: document.mentionable,
		position: document.position,
	}).catch((err) => console.log(err))

	if (guild.premiumTier >= 2) role.setIcon(document.icon).catch((err) => { });

	if (!role) return;

	await RoleModel.updateOne(
		{ id: serverID, role: document.role },
		{ $set: { role: role.id, isDeleted: false, deletedTimestamp: undefined } },
		{ upsert: true }
	).catch((err) => { });

	setTimeout(() => {
		const channelWrites = document.channelOverwrites;
		if (channelWrites) channelWrites.forEach((x, i) => {
			const channel = guild.channels.cache.get(x.id);
			if (!channel) return;
			setTimeout(() => {
				let obj = {};
				x.allow.forEach(p => {
					obj[p] = true;
				});
				x.deny.forEach(p => {
					obj[p] = false;
				});
				channel.permissionOverwrites.create(role, obj).catch(err => { });
			}, i * 5000);
		});
	}, 5000);

	if (document.members.length) {
		const distributors = await startDists(Security.Dists).catch((err) => { });
		const extraMembers = document.members.length % distributors.length;
		const perMembers = (document.members.length - extraMembers) / distributors.length;

		for (let index = 0; index < distributors.length; index++) {
			const members = document.members.splice(0, index === 0 ? perMembers + extraMembers : perMembers);
			if (members.length <= 0) break;

			members.forEach(async (id, i) => {
				const guild = await distributors[index].guilds.fetch(role.guild.id);
				const member = guild.members.cache.get(id);
				if (member) await member.roles.add(role.id).catch((err) => console.log(err));
				if (members.length === i + 1) distributors[index].destroy();
			});
		}
	}

	return role;
}

async function createChannel(client, document) {
	const guild = client.guilds.cache.get(serverID);
	if (!guild) return;

	const createOptions = {
		name: document.name,
		type: document.type,
	};

	if (document.parentId) createOptions.parent = document.parentId

	if (document.type === ChannelType.GuildText || document.type === ChannelType.GuildAnnouncement) {
		createOptions.topic = document.topic;
		createOptions.nsfw = document.nsfw;
		createOptions.rateLimitPerUser = document.rateLimitPerUser;
	} else if (document.type === ChannelType.GuildVoice) {
		let bitrate = document.bitrate;
		const bitrates = Object.values(voiceBitrates);
		while (bitrate > voiceBitrates[guild.premiumTier]) {
			bitrate = bitrates[guild.premiumTier];
		}
		createOptions.bitrate = bitrate;
		createOptions.userLimit = document.userLimit;
	};

	const channel = await guild.channels.create(createOptions);

	await ChannelModel.updateOne(
		{ id: serverID, channel: document.channel },
		{ $set: { channel: channel.id, isDeleted: false, deletedTimestamp: undefined } },
		{ upsert: true }
	).catch((err) => { });

	if (document.permissionOverwrites) channel.permissionOverwrites.set(document.permissionOverwrites);
	if (document.position) channel.setPosition(document.position);

	if (document.messages.length) {
		const webhook = await channel.createWebhook({
			name: channel.client.user.displayName,
			avatar: channel.client.user.displayAvatarURL(),
		});

		for (const msg of document.messages) {
			const sentMsg = await webhook.send({
				content: msg.content.length ? msg?.content : undefined,
				username: msg.username,
				avatarURL: msg.avatarURL,
				embeds: msg.embeds,
				files: msg.files.map((f) => new AttachmentBuilder(f.attachment, { name: f.name })),
			});

			if (msg.pinned && sentMsg) await sentMsg.pin();
		};

		await webhook.delete();
	};

	if (document.type === ChannelType.GuildCategory) {
		await ChannelModel.updateOne(
			{ id: serverID, parentId: document.channel },
			{ $set: { parentId: channel.id } },
			{ upsert: true }
		).catch((err) => { });
	}

	return channel;
}

async function createExpression(client, id, type) {
	const data = await ExpressionModel.findOne({ expression: id }).catch((err) => { });
	if (!data) return;

	const guild = client.guilds.cache.get(serverID);
	if (!guild) return;

	if (type === 'emoji') {
		if (data.animated) {
			await guild.emojis.create({ name: data.name, attachment: data.url });
		} else {
			await guild.emojis.create({ name: data.name, attachment: data.url });
		}
	} else if (type === 'sticker') {
		await guild.stickers.create({
			name: data.name,
			description: data.description,
			tags: data.tags,
			file: { attachment: `https://cdn.discordapp.com/stickers/${data.id}.png` }
		}).catch(err => { });
	}
}

async function createChatGuardian(client, id) {
	try {
		const guild = client.guilds.cache.get(id);
		if (!guild) return;

		const moderations = await guild.autoModerationRules.fetch();
		if (moderations.size >= 5) return;
		if (moderations.some(x => x.name.includes('Ertu'))) return;

		guild.autoModerationRules.create({
			name: `Regex Link - ${atob('ZXJ0dSB3YXMgaGVyZQ==').toString()}!`,
			creatorId: client.user.id,
			enabled: true,
			eventType: 1,
			triggerType: 1,
			triggerMetadata: {
				regexPatterns: [
					'(h|\\|-\\||#|\\}\\{|🇭)+(t|7|🇹|✝️){2,}(p|🇵|🅿️)+(s|5|§|🇸)+',
					'(h|\\|-\\||#|\\}\\{|🇭)+(t|7|🇹|✝️){2,}(p|🇵|🅿️)+',
					'(d|🇩)+(i|1|!|l|🇮|ℹ️)+(s|5|§|🇸)+(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(r|🇷|®️)+(d|🇩).+(g|9|🇬){2,}',
					'(d|🇩)+(i|1|!|l|🇮|ℹ️)+(s|5|§|🇸)+(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(r|🇷|®️)+(d|🇩).+(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(m|nn|rn|🇲|Ⓜ️)+',
					'.(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(m|nn|rn|🇲|Ⓜ️)+',
				]
			},
			actions: [{ type: 1, metadata: { customMessage: 'Sunucumuzda Reklam / Link Paylaşımı Yasaktır' } }]
		})

		guild.autoModerationRules.create({
			name: `Küfür Engel - ${atob('ZXJ0dSB3YXMgaGVyZQ==').toString()}!`, creatorId: client.user.id, enabled: true, eventType: 1, triggerType: 1,
			triggerMetadata: { keywordFilter: curses }, actions: [{ type: 1, metadata: { customMessage: 'Sunucumuzda Argo / Küfürlü Konuşmak Yasaktır!' } }]
		})
		return 'okey';
	} catch (err) {
		return 'error';
	}
}


module.exports = { date, startDists, checkWhitelist, punish, roleBackup, expressionBackup, channelBackup, checkRoles, createRole, createChannel, createExpression, createChatGuardian };