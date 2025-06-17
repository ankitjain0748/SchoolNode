const { UserRefralfind } = require("../Controller/UserController");

const authRoute = require("express").Router();

authRoute.get("/refral/:refral_code",  UserRefralfind);



module.exports = authRoute;
