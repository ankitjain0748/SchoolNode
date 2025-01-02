const Router = require("express").Router();
const { CoursePost, CourseGet, CourseGetId, CourseUpdate, CourseIdDelete, onlinePost, OnlineGet, onlineupdate, OnlineIdDelete, OnlineGetId } = require("../Controller/CourseController");

Router.post("/course_post", CoursePost)

Router.get("/course_get/:Id", CourseGetId)

Router.get("/course_get", CourseGet)

Router.post("/course_update", CourseUpdate)

Router.post("/course_delete", CourseIdDelete)

// Online Chnage

Router.post("/online_post", onlinePost)
Router.get("/online_get", OnlineGet)
Router.post("/online_update", onlineupdate)
Router.post("/online_delete", OnlineIdDelete)
Router.get("/online_get/:Id", OnlineGetId)



module.exports = Router;



