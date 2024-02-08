const redis = require('redis');
const client = redis.createClient();

client.on('error', error => {
    console.log('Redis client error', error);
});

client.connect().then(r => {
    console.log('Client connected')
});

client.set('key', 0);

let startDate = Date.now();
for (let i = 0; i < 10000; i++) {
    client.incr('key');
}
let endDate = Date.now();
let incrResult = endDate - startDate;

startDate = Date.now();
for (let i = 0; i < 10000; i++) {
    client.decr('key');
}
endDate = Date.now();
let decrResult = endDate - startDate;
console.log(`Incr: ${incrResult} ms`);
console.log(`Decr: ${decrResult} ms`);