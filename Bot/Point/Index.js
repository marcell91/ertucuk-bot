(async () => {
    const { ertuClient } = require('../../Global/Base/Client');
    const { Main, Monitor } = require('../../Global/Settings/System');

    const client = global.client = new ertuClient({
        Token: Main.Point,
        Prefix: Main.Prefix,
        Webhooks: Monitor,

        Debugger: false,
        Commands: false,
    });

    await client.spawn();
})();