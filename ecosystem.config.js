const Settings = require('./Global/Settings/System');

let bots = [];

/*/if (Settings.Welcome.Tokens.length > 0)
    bots.push({
        name: Settings.serverName + '-Welcomes',
        namespace: 'ertu',
        script: 'Start.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Bot/Welcomes/',
        args: ['--color', '--watch'],
    });/*/

if (Settings.Main.Mainframe)
    bots.push({
        name: Settings.serverName + '-Mainframe',
        namespace: 'ertu',
        script: 'Index.js',
        watch: true,
        exec_mode: 'cluster',
        max_memory_restart: '512M',
        cwd: './Bot/Mainframe',
        args: ['--color', '--watch'],
    });

if (Settings.Main.Elixir)
    bots.push({
        name: Settings.serverName + '-Elixir',
        namespace: 'ertu',
        script: 'Index.js',
        watch: true,
        exec_mode: 'cluster',
        max_memory_restart: '512M',
        cwd: './Bot/Elixir',
        args: ['--color', '--watch'],
    });

if (Settings.Main.Point)
    bots.push({
        name: Settings.serverName + '-Point',
        namespace: 'ertu',
        script: 'Index.js',
        watch: true,
        exec_mode: 'cluster',
        max_memory_restart: '512M',
        cwd: './Bot/Point',
        args: ['--color', '--watch'],
    });


/*/if (Settings.Security.Logger)
    bots.push({
        name: Settings.serverName + '-Logger',
        namespace: 'ertu',
        script: 'index.js',
        watch: true,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Bot/Guardian/I',
        args: ['--color', '--watch'],
    });

if (Settings.Security.Punish)
    bots.push({
        name: Settings.serverName + '-Punish',
        namespace: 'ertu',
        script: 'index.js',
        watch: true,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Bot/Guardian/II',
        args: ['--color', '--watch'],
    });

if (Settings.Security.Backup)
    bots.push({
        name: Settings.serverName + '-Backup',
        namespace: 'ertu',
        script: 'index.js',
        watch: true,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Bot/Guardian/III',
        args: ['--color', '--watch'],
    });/*/

module.exports = { apps: bots };