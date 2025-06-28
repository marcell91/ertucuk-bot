const mongoose = require('mongoose');

class DatabaseConnection {
    static async start(client) {
        try {
            mongoose.set('strictQuery', true);
            await mongoose.connect(client.system.database, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10
            });
            
            client.logger.success('Mongoose connected');

            mongoose.connection.on('error', (err) => {
                client.logger.error(`Mongoose connection error: \n${err.stack}`);
            });

            mongoose.connection.on('disconnected', () => {
                client.logger.error('Mongoose disconnected');
                setTimeout(() => {
                    DatabaseConnection.start(client);
                }, 5000);
            });
        } catch (error) {
            client.logger.error(`Mongoose initial connection error: \n${error.stack}`);
            setTimeout(() => {
                DatabaseConnection.start(client);
            }, 5000);
        }
    }

    static async ping() {
        try {
            const currentNano = process.hrtime();
            await mongoose.connection.db.command({ ping: 1 });
            const time = process.hrtime(currentNano);
            return (time[0] * 1e9 + time[1]) * 1e-6;
        } catch (error) {
            throw new Error(`MongoDB ping failed: ${error.message}`);
        }
    }
}

module.exports = DatabaseConnection;