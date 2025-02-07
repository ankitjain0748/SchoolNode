const ContactRoute = require("express").Router();

const { ContactPost, ContactGet , ContactDelete} = require("../Controller/ContactController");

ContactRoute.post("/contact-add", ContactPost);

ContactRoute.get("/contact-get", ContactGet);

ContactRoute.post("/contact_delete", ContactDelete);

module.exports = ContactRoute;