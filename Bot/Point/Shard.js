const { ShardingManager } = require('discord.js');
const { Main } = require('../../Global/Settings/System');
const { Logger: { success, line } } = require('../../Global/Helpers');

line();
const manager = new ShardingManager(`${__dirname}/Index.js`, {
    totalShards: 1,
    mode: 'process',
    token: Main.Point,
});

manager.on('shardCreate', (shard) => 
    success(`[INFO - ELIXIR] Launched Shard ${shard.id}`
));

manager.spawn({ timeout: -1 });