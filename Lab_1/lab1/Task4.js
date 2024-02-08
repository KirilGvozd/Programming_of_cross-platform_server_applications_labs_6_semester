const redis = require('redis');
const client = redis.createClient(); // Подключение к локальному Redis серверу

client.connect().then(r => {
    console.log('Client connected');
})

let startTime = Date.now();
for (let i = 0; i < 10000; i++) {
    client.hSet('myhash', `field${i}`, `value${i}`);
}
let endTime = Date.now();
console.log(`hSet: ${endTime - startTime} ms`);

startTime = Date.now();
for (let i = 0; i < 10000; i++) {
    client.hGet('myhash', `field${i}`);
}
endTime = Date.now();
console.log(`hGet: ${endTime - startTime} ms`);