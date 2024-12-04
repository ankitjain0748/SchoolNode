const subscribeget = require("express").Router();

const { SubscribePost, Subscribeget } = require("../Controller/SubScribeController");

subscribeget.post("/subscribe-add", SubscribePost)

subscribeget.get("/subscribe-get", Subscribeget)



module.exports = subscribeget;