const fs = require('fs');
const contacts = require('./contacts.json');

const getAllContacts = async () => {
    await contacts;
}


const getContact = async id => {
    const contact = await contacts.find(contct => contct.id === id);
    return contact ? contact : 'Not found'
};


const addContact = async data => {
    contacts.push({
        id: getRandomInt(),
        name: data.name,
        phone: data.phone
    });
    await saveToFile();
    return contacts;
};


const editContact = async (id, data) => {
    const contact = await contacts.find(contct => contct.id === id);
    if (contact) {
        contact.name = data.name;
        contact.phone = data.phone;
    }
    await saveToFile();
    return contacts;
};


const deleteContact = async id => {
    const index = contacts.findIndex(contct => contct.id === id);
    if (index !== -1) {
        contacts.splice(index, 1);
    }
    await saveToFile();
    return contacts;
};


const saveToFile = async () => {
    try {
        await fs.promises.writeFile('./contacts.json', JSON.stringify(contacts, null, 4));
    }
    catch (error) {
        console.log(error);
    }
};

function getRandomInt() {
    return Math.floor(Math.random() * 10);
}

module.exports = {
    getAllContacts,
    getContact,
    addContact,
    editContact,
    deleteContact
};