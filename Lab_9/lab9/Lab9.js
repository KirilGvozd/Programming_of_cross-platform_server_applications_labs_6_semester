const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const PORT = 5000;

let options = {
    key: fs.readFileSync('../CA.key').toString(),
    passphrase: 'GVOZD',
    cert: fs.readFileSync('../CA.crt').toString(),
};

app.get('/', (req, res) => res.send('Hello World!K'));

https.createServer(options, app).listen({
    port: PORT
}, () => console.log(`Server running at localhost:${PORT}/\n`));