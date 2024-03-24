const express = require('express');
const fs = require('fs');
const app = express();
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const session = require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: '1111'
});
const users = JSON.parse(fs.readFileSync('Data.json'));

app.use(session);
app.use(passport.initialize());
passport.use(new BasicStrategy((login, password, done) => {
    console.log(`\nlogin = ${login}, password = ${password}`);
    let returnCode;
    let credentials = getCredentials(login);
    if (!credentials) {
        returnCode = done(null, false, { message: 'Incorrect login' });
        console.log(`Incorrect login or password: login = ${login}, password = ${password}`);
    } else if (!verifyPassword(credentials.password, password)) {
        returnCode = done(null, false, { message: 'Incorrect password' });
        console.log(`incorrect: login = ${login}, password = ${password}`);
    } else {
        returnCode = done(null, login);
    }
    return returnCode;
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
}, passport.authenticate('basic', { session: false }))
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