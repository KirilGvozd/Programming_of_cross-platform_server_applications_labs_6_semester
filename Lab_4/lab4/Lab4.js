const express = require('express');
const bodyParser = require('body-parser');
const contactRouter = require('./router');
const app = express();
const hbs = require('express-handlebars').create({
    extname: '.hbs',
    helpers: { dismiss: () => "window.location.href = '/'" }
});


app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(express.json());
app.use('/', contactRouter);


app.listen(3000);
console.log(`Server is running on http://localhost:3000`);