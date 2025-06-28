const { codeBlock } = require('discord.js');
const util = require('util')

module.exports = {
    name: 'ertubaba',
    aliases: ['ertubaba'],

    execute: async (client, message, args) => {
        try {
            const code = args.join(' ')
            if (code.includes('token')) return message.reply({ content: `Tokenimi vermem.` })
            if (!code) return message.reply({ content: `Lütfen bir kod giriniz.` })

            let evaled = eval(code)
            let promise, output

            if (evaled instanceof Promise) {
                message.channel.sendTyping()
                promise = await evaled
                    .then((res) => {
                        return { resolved: true, body: util.inspect(res, { depth: 0 }) }
                    })
                    .catch((err) => {
                        return { rejected: true, body: util.inspect(err, { depth: 0 }) }
                    })
            }

            if (promise) {
                output = clean(promise.body)
            } else {
                output = clean(evaled)
            }

            const texts = splitMessage(clean(output), { maxLength: 2000 })
            for (const newText of texts) message.channel.send(codeBlock('xl', newText))
        } catch (error) {
            const texts = splitMessage(clean(error.message), { maxLength: 2000 })
            for (const newText of texts) message.channel.send(codeBlock('xl', newText))
        }
    }
}

function clean(text) {
    if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
    text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
    return text
}

function splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
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
};