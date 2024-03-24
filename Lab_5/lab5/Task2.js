const express = require('express');
const fs = require('fs');
const app = express();
const passport = require('passport');
const {DigestStrategy} = require("passport-http");
const session = require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: '1111'
});
const users = JSON.parse(fs.readFileSync('Data.json'));

app.use(session);
app.use(passport.initialize());
passport.use(new DigestStrategy({ qop: 'auth' }, (login, done) => {
    console.log(`\nlogin = ${login}`);
    let returnCode = null;
    let credentials = getCredentials(login);
    if (!credentials) {
        returnCode = done(null, false);
        console.log(`Denied: login = ${login}`);
    }
    else
        returnCode = done(null, credentials.login, credentials.password);
    return returnCode;
}, (params, done) => {
    console.log('Parameters: ', params);
    done(null, true);
}));
app.get('/', (request, response) => {
    response.redirect('/login')
});

app.get('/login', (request, response, next) => {
    if (request.session.logout) {
        request.session.logout = false;
        delete request.headers['authorization'];
    }
    next();
}, passport.authenticate('digest', { session: false }))
    .get('/login', (request, response) => {
        response.redirect('/resource');
    });

app.get('/logout', (request, response) => {
    request.session.logout = true;
    response.redirect('/login');
});

app.get('/resource', (request, response) => {
    if (request.headers['authorization']) {
        response.send('Resource');
    } else {
        response.redirect('/login');
    }
});

app.get('*', (request, response) => {
    response.status(404).send('Not Found');
});



const getCredentials = login => {
    console.log('Login: ', login)
    console.log('Found: ', users.find(user => user.login.toUpperCase() === login.toUpperCase()))
    return users.find(user => user.login.toUpperCase() === login.toUpperCase());
}
const verifyPassword = (firstPassword, secondPassword) => firstPassword === secondPassword;
app.listen(3000, () => console.log(`Server is running at http://localhost:3000\n`));