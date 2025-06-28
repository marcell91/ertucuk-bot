const { Commands: { MessageCommandsHandler } } = require('../../../../../Global/Handlers');

module.exports = async function commandHandler(client, message) {
    if (message.author.bot) return;

    if (client.ertu.Commands) {
        await MessageCommandsHandler(client, message);
        return;
    };
} // This snippet is used to handle the message event. It is used to handle the commands. It is used in the mainframe