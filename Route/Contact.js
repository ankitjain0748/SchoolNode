const ContactRoute = require("express").Router();

const { ContactPost, ContactGet, ContactReply, Emailcheck } = require("../Controller/ContactController");

ContactRoute.post("/contact-add", ContactPost)

ContactRoute.get("/contact-get", ContactGet);

ContactRoute.post("/contact-reply", ContactReply)

ContactRoute.get("/email", Emailcheck)

module.exports = ContactRoute;