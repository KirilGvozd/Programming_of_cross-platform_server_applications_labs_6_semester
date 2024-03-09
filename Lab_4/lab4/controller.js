const contactService = require('./service');

module.exports = {
    getAllContacts(request, response) {
        try {
            const contacts = contactService.getAllContacts();
            response.render('contacts', {
                buttonsEnabled: true,
                contacts: contacts
            });
        } catch (error) {
            console.log(error);
        }
    },

    async getContact(request, response) {
        try {
            if (request.query.id) {
                const contact = await contactService.getContact(request.query.id);
                response.json(contact);
            } else {
                response.end('Parameter not found');
            }
        } catch (error) {
            console.log(error);
        }
    },


    async addContactPost(request, response) {
        if (request.body.name && request.body.phone) {
            await contactService.addContact(request.body).then(result => {
                response.json(result);
            }).catch(error => {
                console.error(error.message);
            });
        } else {
            response.end('Parameters not found');
        }
    },


    async addContactGet(request, response) {
        let contacts = [];
        contacts = await contactService.getAllContacts();
        response.render('newContact.hbs', {
            buttonsEnabled: false,
            contacts: contacts
        });
    },


    async editContactPost(request, response) {
        if (request.query.id && request.body.name && request.body.phone) {
            await contactService.editContact(request.query.id, request.body).then(result => {
                response.json(result);
            }).catch(error => {
                console.log(error.message);
            })
        } else {
            response.end('Parameters not found');
        }
    },


    async editContactGet(request, response) {
        let contacts = [], contact;
        contacts = await contactService.getAllContacts();
        contact = await contactService.getContact(request.query.id);
        response.render('editContact', {
            buttonsEnabled: false,
            contacts: contacts,
            thisContact: contact
        });
    },


    async deleteContact(request, response) {
        if (request.query.id) {
            await contactService.deleteContact(request.query.id).then(result => {
                response.json(result);
            }).catch(error => {
                console.log(error.message);
            });
        } else {
            response.end('Parameters not found');
        }
    }
};