(async () => {
    const { ertuClient } = require('../../Global/Base/Client');
    const { Main, Monitor } = require('../../Global/Settings/System');

    const client = global.client = new ertuClient({
        Token: Main.Mainframe,
        Prefix: Main.Prefix,
        Webhooks: Monitor,

        Debugger: false,
        Commands: true,
    });

    await client.spawn();
})();