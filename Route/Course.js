const Router = require("express").Router();
const { CoursePost, CourseGet, CourseGetId, CourseUpdate, CourseIdDelete, onlinePost, OnlineGet, onlineupdate, OnlineIdDelete, OnlineGetId, CoursepriceUpdate, Webniarpost, WebniarGet, WebniarGetId, Webniarupdate, WebniarIdDelete } = require("../Controller/CourseController");

Router.post("/course_post", CoursePost)

Router.get("/course_get/:Id", CourseGetId)

Router.get("/course_get", CourseGet)

Router.post("/course_update", CourseUpdate)

Router.post("/course_delete", CourseIdDelete)

Router.post("/course_price", CoursepriceUpdate)


// Online Chnage

Router.post("/online_post", onlinePost)
Router.get("/online_get", OnlineGet)
Router.post("/online_update", onlineupdate)
Router.post("/online_delete", OnlineIdDelete)
Router.get("/online_get/:Id", OnlineGetId)

// Webniar chnage

Router.post("/webniar_post", Webniarpost)
Router.get("/webniar_get_data", WebniarGet)
Router.post("/webniar_update", Webniarupdate)
Router.post("/webniar_delete", WebniarIdDelete)
Router.get("/webniar_get/:Id", WebniarGetId)


module.exports = Router;



