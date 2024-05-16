const TelegramBot = require('node-telegram-bot-api');
const token = '7110217431:AAFPQXXRLnuK2S9U492-Qj1_gVYiTI-HJ5w';
const request = require('request');
const bot = new TelegramBot(token, { polling: true });
const THE_CAT_API_KEY = "live_sUufaup5ZIOcn9UjLVBS0SYyTSc8wlbUeVcbnSTWTW5Rzv8pOLedxMFLnXPq1D5r";
const THE_API_KEY = "hxu4gKBRTkmIwRkAc472ow==FoNc4AsPTAURpDJP"
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./subscribers.db');
const axios = require('axios');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS subscribers (chat_id INTEGER PRIMARY KEY)");
});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if(msg.text === null){
        return;
    }
    bot.sendMessage(chatId, msg.text);
});

bot.onText('', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.toLowerCase() === 'привет') {
        const stickerFileId = 'CAACAgIAAxkBAAEFeoNmRj2L5cMISbzv1HjJG8k_jW84RAACJD8AAlUDaEgBW9n4mcteezUE';
        bot.sendSticker(chatId, stickerFileId).catch(error => {
            console.error(error);
        });
    }

    if(msg.text.toLowerCase() === '/subscribe'){
        db.run("INSERT INTO subscribers(chat_id) VALUES (?)", [chatId], (err) => {
            if (err) {
                return bot.sendMessage(chatId, "Maybe you're already subscribed!");
            }
            bot.sendMessage(chatId, "You're subscribed successfully!");
        });
    }

    if(msg.text.toLowerCase() === '/unsubscribe'){
        db.run("DELETE FROM subscribers WHERE chat_id = ?", [chatId], (err) => {
            if (err) {
                return bot.sendMessage(chatId, "Maybe you're not subscribed");
            }
            bot.sendMessage(chatId, "You're unsubscribed successfully!");
        });
    }

    if (msg.text.toLowerCase() === '/joke') {

        request.get({
            url: 'https://api.api-ninjas.com/v1/jokes?limit=1',
            headers: {
                'X-Api-Key': THE_API_KEY
            },
        }, function(error, response, body) {
            if(error) {
                bot.sendMessage(chatId, 'There is an error with getting the joke.');
                return console.error('Request failed:', error);
            } else if(response.statusCode !== 200) {
                bot.sendMessage(chatId, 'Failed to get the joke: ' + response.statusCode);
                return console.error('Error:', response.statusCode, body.toString('utf8'));
            } else {

                try {
                    const joke = JSON.parse(body);
                    let jokeMessage = joke.map(joke => joke.joke).join('nn');
                    bot.sendMessage(chatId, jokeMessage);
                } catch (parseError) {
                    bot.sendMessage(chatId, 'There is an error with handling the joke.');
                    return console.error('Parse failed:', parseError);
                }
            }
        });
    }

    if (msg.text.toLowerCase() === '/weather') {

        request.get({
            url: 'https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid=e5b4e011e4150861143854b4b8f69d8a',
            headers: {
                'X-Api-Key': 'e5b4e011e4150861143854b4b8f69d8a'
            },
        }, function(error, response, body) {
            if (error) {
                bot.sendMessage(chatId, 'There is an error in request!');
                return console.error('Request failed:', error);
            } else if(response.statusCode !== 200) {
                bot.sendMessage(chatId, 'Can\'t find the weather ' + response.statusCode);
                return console.error('Error:', response.statusCode, body.toString('utf8'));
            } else {

                try {
                    const jsonObject = JSON.parse(body);

                    let formattedJsonStr = '';

                    for (const key in jsonObject) {
                        if (jsonObject.hasOwnProperty(key)) {
                            formattedJsonStr += `${key}: ${JSON.stringify(jsonObject[key])}\n`;
                        }
                    }
                    bot.sendMessage(chatId, formattedJsonStr);
                } catch (parseError) {
                    bot.sendMessage(chatId, 'There is an error in weather handling.');
                    return console.error('Parse failed:', parseError);
                }
            }
        });
    }

    if(msg.text.toLowerCase() === '/cat'){

        axios.get('https://api.thecatapi.com/v1/images/search', {
            headers: {
                'x-api-key': THE_CAT_API_KEY
            }
        })
            .then(response => {
                const imageUrl = response.data[0].url;
                bot.sendPhoto(chatId, imageUrl);
            })
            .catch(error => {
                bot.sendMessage(chatId, 'There is an error in getting the cat image.');
                console.error(error);
            });
    }

});




const cron = require('node-cron');

cron.schedule('* * * * *', () => {
    db.all("SELECT chat_id FROM subscribers", [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            sendFact(row.chat_id);
        });
    });
});

function sendFact(chatId) {

    request.get({
        url: 'https://api.api-ninjas.com/v1/facts',
        headers: {
            'X-Api-Key': THE_API_KEY
        },
    }, function(error, response, body) {
        if(error) {
            bot.sendMessage(chatId, 'There is an error with getting the facts.');
            return console.error('Request failed:', error);
        } else if(response.statusCode !== 200) {
            bot.sendMessage(chatId, 'Failed to get the facts: ' + response.statusCode);
            return console.error('Error:', response.statusCode, body.toString('utf8'));
        } else {
            try {
                const facts = JSON.parse(body);
                let factsMessage = facts.map(fact => fact.fact).join('nn');
                bot.sendMessage(chatId, factsMessage);
            } catch (parseError) {
                bot.sendMessage(chatId, 'There is an error with handling the facts.');
                return console.error('Parse failed:', parseError);
            }
        }
    });
}