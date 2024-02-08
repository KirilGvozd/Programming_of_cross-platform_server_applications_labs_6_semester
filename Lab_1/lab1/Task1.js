const redis = require('redis')

const client = redis.createClient();

client.on('error', error => {
    console.log('Redis Client Error ', error);
});

client.connect().then(r => console.log("Client connected"));