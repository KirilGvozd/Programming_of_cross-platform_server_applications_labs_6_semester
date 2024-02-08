const redis = require('redis');
const client = redis.createClient();
const subscriber = client.duplicate();

subscriber.connect();

subscriber.on('message', (message) => {
    console.log(`Received the following message from channel: ${message}`);
});

subscriber.subscribe('notification', message => {
    console.log(message);
});