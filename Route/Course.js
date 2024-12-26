const Router = require("express").Router();
const { CoursePost, CourseGet, CourseGetId, CourseUpdate, CourseIdDelete } = require("../Controller/CourseController");

Router.post("/course_post", CoursePost)

Router.get("/course_get/:Id", CourseGetId)

Router.get("/course_get", CourseGet)

Router.post("/course_update", CourseUpdate)

Router.post("/course_delete", CourseIdDelete)

module.exports = Router;



