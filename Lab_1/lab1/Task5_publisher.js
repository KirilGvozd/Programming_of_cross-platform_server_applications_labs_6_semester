const redis = require('redis');
const publisher = redis.createClient();

publisher.connect();

const sleep = sec => {
    new Promise(resolve => {
        setTimeout(resolve, sec * 1000);
    });
};

sleep(4);

for (let i = 0; i < 10; i++) {
    publisher.publish('notification', 'Message: Hello from Kirill');
}