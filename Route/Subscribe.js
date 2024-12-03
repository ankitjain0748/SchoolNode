const ContactRoute = require("express").Router();

const { ContactPost } = require("../Controller/SubScribeController");

ContactRoute.post("/contact-add", ContactPost)


module.exports = ContactRoute;