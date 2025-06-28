const mongoose = require('mongoose');
const { database } = require('../../../Global/Settings/System')

module.exports = {
    start: async (client) => {
        try {
            await mongoose.connect(database, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000,
            });
            
            console.log('MongoDB bağlantısı başarılı');
        } catch (error) {
            console.error('MongoDB bağlantı hatası:', error);
        }

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB bağlantı hatası:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.error('MongoDB bağlantısı kesildi');
        });
    },

    async ping() {
        try {
            const currentNano = process.hrtime();
            await mongoose.connection.db.command({ ping: 1 });
            const time = process.hrtime(currentNano);
            return (time[0] * 1e9 + time[1]) * 1e-6;
        } catch (error) {
            console.error('MongoDB ping hatası:', error);
            return null;
        }
    },
};