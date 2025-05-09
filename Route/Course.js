const Router = require("express").Router();
const { CoursePost, CourseGet, CourseGetId, CourseUpdate, CourseIdDelete, onlinePost, OnlineGet, onlineupdate, OnlineIdDelete, OnlineGetId, CoursepriceUpdate, Webniarpost, WebniarGet, WebniarGetId, WebinarUpdate, WebniarIdDelete, Tranningpost, TranningGet, TranningGetId, tranningUpdate, trannigIdDelete } = require("../Controller/CourseController");

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
Router.post("/webniar_update", WebinarUpdate)
Router.post("/webniar_delete", WebniarIdDelete)
Router.get("/webniar_get/:Id", WebniarGetId)


// Video Tranning


Router.post("/video_traning_add", Tranningpost);

Router.get("/video_traning_get", TranningGet);

Router.get("/video_traning_get_by_id/:Id", TranningGetId);

Router.post("/video_traning_update", tranningUpdate);

Router.post("/video_traning_delete", trannigIdDelete);


module.exports = Router;



