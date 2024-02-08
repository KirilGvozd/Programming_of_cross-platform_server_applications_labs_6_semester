const redis = require('redis');
const client = redis.createClient();

client.on('error', error => {
    console.log('Redis client error', error);
});

client.connect().then(r => {
    console.log('Client connected')
})

let startDate = Date.now();
for (let i = 0; i < 10000; i++) {
    client.set(`key${i}`, i);
}
let endDate = Date.now();
setResult = endDate - startDate;
console.log(`Set: ${setResult} ms`);

startDate = Date.now();
for (let i = 0; i < 10000; i++) {
    let element = client.get(`key${i}`);
    console.log(element);
}
endDate = Date.now();
getResult = endDate - startDate;
console.log(`Get: ${getResult} ms`);

startDate = Date.now();
for (let i = 0; i < 10000; i++) {
    client.del(`key${i}`);
}
endDate = Date.now();
delResult = endDate - startDate;
console.log(`Del: ${delResult} ms`);