const {MongoClient} = require('mongodb');

// Connection URL
const url = 'mongodb+srv://rootx:5iKDfu0daglVBZhx@cluster0.6pjjs4p.mongodb.net/?retryWrites=true&w=majority';

// Database Name
const dbName = 'studioDb';

// Create a global variable for the database connection
let db;

// Create a singleton object to export
const database = {
    connect: async function () {
        // Create a new MongoClient
        const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

        // Connect to the server
        await client.connect().then(() => {
            console.log("Connected successfully to server");

            // Save the database connection to the global variable
            db = client.db(dbName);
        }).catch(err => {
            console.error(err.stack);
            process.exit(1);
        });
    },
    close: function () {
        db.close(function () {
            console.log('Database connection closed');
            process.exit(0);
        });
    },
    getDb: function () {
        return db;
    }
};

module.exports = database;
