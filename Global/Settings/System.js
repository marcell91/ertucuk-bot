const { ActivityType } = require('discord.js');

module.exports = {
    serverID: '',
    serverName: 'Panteon',
    ownerID: ['',""],
    channelID: '1338969363750981662',
    database: 'mongodb://localhost:27017/panteon',

    Presence: {
        Status: 'dnd',
        Type: ActivityType.Playing,
        Message: [
            'SIKTIM was here ❤️',
        ]
    },

    Monitor: [
        { ID: 'System', Webhook: '' },
        { ID: 'Servers', Webhook: '' }, 
        { ID: 'Feedbacks', Webhook: '' },
        { ID: 'Bugs', Webhook: '' },
    ],

    Main: {
        Mainframe: 'MTM4MjAxMzkxMjc5MDIwODU2Mw.GYoDnl.LKMszMYU',
        Elixir: 'MTM4MjAxNDA4NDI1MzM1MjA0Ng.GcPbVc0Euh9-FU4',
        Point: 'MTM4MjAxNDM0ODM2MDI4NjMwOQ.GVgnSJ.XjxdZM',
        Prefix: ['.'],
    },

    Welcome: {
        Tokens: [
            'MTM0Njk1NDM0zdKVbdNKy5-5UvrM',
            'MTM0Njk1NDg5MTPoMo',
            'MTM0Njk1NM4s',
            'MTM0Njk1NTA0NjE1NThn9R9wi5WKc',
            'MTM0Njk1NTExODUxOTc4MQ',
        ],
        Channels: [
            '1338969220490465280',
            '1338969229533249577',
            '1339734366066315295',
            '1339734409548664832',
            '1338969246188699730',
        ],
    },

    Security: {
        Logger: 'MT6bxhdF3ehA2u15VFnn4M',
        Punish: 'MTM0Njk50vJfcoXUS32ckuA',
        Backup: 'MTM0NjvULtXmn1FezSYU',
        Dists: [
            'MTM0Ng6lFzadZ0',
            'MTM0Njk1NjM5OG9c',
            'MTM0Njkf9O-AoytoeYEk8UdY',
            'MTM0Njk1NjY5MwWIne4',
            'MTM0Njk1Njc0tbG9uo',
        ],
        BotsIDs: [
            '1346954125056938026',
            '1346954184116801741',
            '1346954291671470080',
            '1346954346327310447',
            '1346954890747842692',
            '1346954953306017824',
            '1346955046155194388',
            '1346955118519783434',
            '1346955253290893342',
            '1346955334597480458',
            '1346955715725492326',
            '1346956169977270405',
            '1346956598924284095',
            '1346956693606502520',
            '1346956744596787240',
            '1346956398856110143'
        ],
        Prefix: '!'
    }
};