const express = require('express');

const { ContactPost, ContactGet, ContactDelete } = require("../Controller/ContactController");
const router = express.Router();

//contact  List 

router.post("/contact-add", ContactPost);

router.get("/contact-get", ContactGet);

router.post("/contact_delete", ContactDelete);


module.exports = router;