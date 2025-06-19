const { UserRefralfind, Courseslug, BlogSlug } = require("../Controller/UserController");

const authRoute = require("express").Router();

authRoute.get("/refral/:refral_code", UserRefralfind);

authRoute.get("/course_get/:slug", Courseslug)

authRoute.get("/blog_get/:slug", BlogSlug)




module.exports = authRoute;
