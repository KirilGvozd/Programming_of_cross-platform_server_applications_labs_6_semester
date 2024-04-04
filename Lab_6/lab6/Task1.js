const express = require('express');
const session = require('express-session');
const passport = require('passport');
const uuid = require('uuid');
const Strategy = require('passport-local');
const path = require('path');
const users = require('./users');

const app = express();
const port = 3000;

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    genid: request => {
        console.log(`Session ID: ${request.sessionID}`);
        return uuid.v4();
    },
    secret: 'my_secret_shh',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) =>
{ done(null, user); }
);

passport.use(new Strategy.Strategy((username, password, done) => {
    const index = users.findIndex(e => e.username === username);
    const user = users[index];

    if (index === -1) {
        return done(null, false, {'Error': 'Incorrect credentials'});
    }
    if (user.password !== password) {
        return done(null, false, {'Error': `Passwords doesn't match`});
    }

    return done(null, user);
}));

app.get('/', (request, response) => {
    response.redirect('/login');
});

app.get('/login', (request, response) => {
    response.sendFile(path.join(__dirname, './static/login.html'));
});

app.post('/login', passport.authenticate('local',
    {
        successRedirect: '/resource',
        failureRedirect: '/login'
    }
));

app.get('/resource', (request, response) => {
    console.log(`Session ID: ${request.sessionID}`);
    if (!request.user) {
        return response.status(401).send('<h2>401: Unauthorized</h2>');
    }
    return response.send(`<h2>RESOURCE, ${request.user.username}!</h2>`);

});

app.get('/logout', (request, response, next) => {
    request.logout(error => {
        if (error) {
            console.log(error);
        }
        response.redirect('/login');
    });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});