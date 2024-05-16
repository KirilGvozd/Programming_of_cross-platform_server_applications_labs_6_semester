const express = require('express');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Bookphone api",
            version: "1.0.0",
            description: "Swagger"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ["./Lab12.js"]
};

const openapiSpecification = swaggerJSDoc(options);

const app = express();
app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

const phonebookFile = './book.json';
function readPhonebook() {
    try {
        const data = fs.readFileSync(phonebookFile, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Failed to read the phonebook:', error);
        return [];
    }
}
function writePhonebook(phonebook) {
    try {
        const data = JSON.stringify(phonebook);
        fs.writeFileSync(phonebookFile, data, 'utf-8');
    }
    catch (error) {
        console.error('Failed to write in the phonebook:', error);
    }
}
app.get('/TS', (req, res) => {
    const phonebook = readPhonebook();
    res.json(phonebook);
});
app.post('/TS', (req, res) => {
    const { id, name, phoneNumber } = req.body;
    const newPhone = { id, name, phoneNumber };
    const phonebook = readPhonebook();
    const isDuplicate = phonebook.some(
        (entry) => entry.name.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
        res.status(409).json({
            error: `Name '${name}' already exists.`,
        });
    }
    else  {
        phonebook.push(newPhone);
        writePhonebook(phonebook);
        res.sendStatus(201);
    }
});
app.put('/TS', (req, res) => {
    const { id, name, phoneNumber } = req.body;
    const phonebook = readPhonebook();
    const phoneIndex = phonebook.findIndex((phone) => phone.id === id);
    if (phoneIndex === -1) {
        res.sendStatus(404);
    }
    else {
        phonebook[phoneIndex] = { id, name, phoneNumber };
        writePhonebook(phonebook);
        res.sendStatus(200);
    }
});
app.delete('/TS', (req, res) => {
    const { id } = req.body;
    const phonebook = readPhonebook();
    const phoneIndex = phonebook.findIndex((phone) => phone.id === id);
    if (phoneIndex === -1) {
        res.sendStatus(404);
    }
    else {
        phonebook.splice(phoneIndex, 1);
        writePhonebook(phonebook);
        res.sendStatus(200);
    }
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


/**
 * @swagger
 * components:
 *   schemas:
 *     PhoneEntry:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - phoneNumber
 *       properties:
 *         id:
 *           type: number
 *           description: ID владельца телефона
 *         name:
 *           type: string
 *           description: Имя владельца телефона
 *         phoneNumber:
 *           type: string
 *           description: Телефонный номер
 */

/**
 * @swagger
 * /TS:
 *   get:
 *     summary: Получить полный список телефонов
 *     responses:
 *       200:
 *         description: Список телефонов получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhoneEntry'
 *   post:
 *     summary: Добавить новый телефон в справочник
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneEntry'
 *     responses:
 *       201:
 *         description: Телефон добавлен в справочник
 *       409:
 *          description: Conflict - Duplicate name
 *          content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: A phone entry with the same name already exists.
 *   put:
 *     summary: Обновить телефон в справочнике
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneEntry'
 *     responses:
 *       201:
 *         description: Телефон обновлен в справочнике
 *   delete:
 *     summary: Удалить телефон из справочника
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneEntry'
 *     responses:
 *       201:
 *         description: Телефон удален из справочника
 */