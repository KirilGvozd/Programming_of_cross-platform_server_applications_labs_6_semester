const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const redis = require('redis');

const port = 3000;
const app = express();
const redisClient = redis.createClient();
redisClient.on('error', (error) => {
    console.log('Error in Redis:', error);
});
redisClient.on('end', () => {
    console.log('Redis client disconnected.\n');
});
redisClient.connect().then(() => {
    console.log('Redis connected.')
}).catch(error => {
    console.log(error);
});

const sequelize = new Sequelize.Sequelize(
    'Users',
    'Kirill_user',
    '1111',
    {
        host: 'localhost',
        dialect: 'mssql'
    }
);

const Model = Sequelize.Model;
class Users extends Model {}
Users.init(
    {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        login: { type: Sequelize.STRING, allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false },
    },
    {
        sequelize,
        Users: 'Users',
        tableName: 'Users',
        timestamps: false
    }
);


async function createUser(login, password) {
    await Users.create({ login: login, password: password });
}


const accessKey = 'access_key';
const refreshKey = 'refresh_key';

app.use(express.static(__dirname + '/static'));
app.use(cookieParser('secret_key'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((request, response, next) => {
    if (request.cookies.accessToken) {
        jwt.verify(request.cookies.accessToken, accessKey, (err, payload) => {
            if (err) {
                next();
            } else if (payload) {
                request.payload = payload;
                next();
            }
        });
    } else next();
});



app.get('/login', (request, response) => {
    response.sendFile(__dirname + '/static/login.html');
});


app.post('/login', async (request, response) => {
    const candidate = await Users.findOne({
        where: {
            login: request.body.username,
            password: request.body.password,
        },
    });
    if (candidate) {
        const accessToken = jwt.sign(
            { id: candidate.id, login: candidate.login },
            accessKey,
            { expiresIn: 10 * 60 }
        );
        const refreshToken = jwt.sign(
            { id: candidate.id, login: candidate.login },
            refreshKey,
            { expiresIn: 24 * 60 * 60 }
        );
        response.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
        });
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/refresh-token',
        });
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/logout',
        });
        response.redirect('/resource');
    } else {
        response.redirect('/login');
    }
});



app.get('/refresh-token', async (request, response) => {
    if (request.cookies.refreshToken) {
        let isToken = await redisClient.get(request.cookies.refreshToken);
        if (isToken === null) {
            jwt.verify(request.cookies.refreshToken, refreshKey, async (error, payload) => {
                if (error) {
                    response.send(error.message);
                } else if (payload) {
                    await redisClient.set(request.cookies.refreshToken, 'blocked');
                    console.log('\nRefresh token: ' + await redisClient.get(request.cookies.refreshToken));

                    const candidate = await Users.findOne({ where: { id: payload.id } });
                    const newAccessToken = jwt.sign(
                        {
                            id: candidate.id,
                            login: candidate.login,
                        },
                        accessKey,
                        { expiresIn: 10 * 60 }
                    );
                    const newRefreshToken = jwt.sign(
                        {
                            id: candidate.id,
                            login: candidate.login,
                        },
                        refreshKey,
                        { expiresIn: 24 * 60 * 60 }
                    );

                    response.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                    });
                    response.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        path: '/refresh-token',
                    });
                    response.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        path: '/logout',
                    });

                    console.log(newRefreshToken);
                    response.redirect('/resource');
                }
            });
        } else
            return response.status(401).send('<h2>401: Invalid token</h2>');
    } else
        return response.status(401).send('<h2>401: Unauthorized</h2>');
});


app.get('/resource', (request, response) => {
    if (request.payload) {
        response.status(200).send(`<h2>Welcome to the resource, ${request.payload.login}!</h2></br>` +
            "<a href='http://localhost:4000/logout'>Log Out</a>");
    } else {
        return response.status(401).send('<h2>401: Unauthorized</h2>');
    }
});

app.get('/logout', async (request, response) => {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    await redisClient.set(request.cookies.refreshToken, 'blocked');
    console.log('\nRefresh token: ' + await redisClient.get(request.cookies.refreshToken));
    response.redirect('/login');
});

app.get('/reg', (req, res) => {
    res.sendFile(__dirname + '/static/register.html');
});


app.post('/reg', (request, response) => {
    console.log(`New user: ${request.body.username}`);
    createUser(request.body.username, request.body.password);
    response.redirect('/login');
});

app.use((request, response, next) => {
    response.status(404).send('404: Not Found');
});

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}).catch((error) => {
    console.log(error);
});