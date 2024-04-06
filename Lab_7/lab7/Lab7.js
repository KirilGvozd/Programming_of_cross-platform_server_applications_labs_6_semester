const express = require('express')
const app = express()
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const path = require('path');
const session = require('express-session');

app.use(passport.initialize());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GitHubStrategy({
        clientID: "491489800baadc5a08e8",
        clientSecret: "b59b7c3641f91d2c80d3fb2fe06baac69627a338",
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

app.get('/login', (request, response) => {
    response.sendFile(path.join(__dirname, './login.html'));
});
app.get('/resource', (request, response) => {
    if (request.isAuthenticated()) {
        return response.send(`RESOURCE: 
        User ID: ${request.user.id}
        \nUsername: ${request.user.displayName}
        \nEmail: ${request.user.email}`);
    }
    return response.redirect('/login');
});
app.get('/logout', (request, response) => {
    request.session.destroy(() => {
        delete request.user;
        response.redirect('/login');
    })
});

app.get('/auth/github', passport.authenticate('github',{ scope: [ 'user:email' ] }));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login', successRedirect: '/resource' }));

app.get('/auth/error', (request, response) => {
    response.send('Unknown Error')
});

app.listen(3000);
console.log('Server is running on http://localhost:3000');