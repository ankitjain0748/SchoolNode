const subscribeget = require("express").Router();

const { SubscribePost, Subscribeget, EmailDataSubScribe, EmailDataContactGet, EmailDataprofile, WebniarEmail } = require("../Controller/SubScribeController");

subscribeget.post("/subscribe-add", SubscribePost)

subscribeget.get("/subscribe-list", Subscribeget)

subscribeget.get("/subscribe-email", EmailDataSubScribe)
subscribeget.get("/contact-email", EmailDataContactGet)
subscribeget.get("/user-email", EmailDataprofile)

subscribeget.post("/webniar_email" , WebniarEmail)


module.exports = subscribeget;