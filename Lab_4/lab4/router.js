const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getAllContacts);
router.get('/id', controller.getContact);

router.get('/add', controller.addContactGet);
router.post('/add', controller.addContactPost);

router.get('/update', controller.editContactGet);
router.post('/update', controller.editContactPost);

router.post('/delete', controller.deleteContact);

module.exports = router;