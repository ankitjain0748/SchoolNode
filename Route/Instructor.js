const Router = require("express").Router();
const { InstructorPost, InstructorGet, InstructorUpdate, InstructorIdDelete ,InstructorGetId } = require("../Controller/InstructorController");



Router.post("/instrutor_post", InstructorPost)

Router.get("/instrutor_get/:Id", InstructorGetId)



Router.get("/instrutor_get", InstructorGet)

Router.post("/instrutor_update", InstructorUpdate)

Router.post("/instrutor_delete", InstructorIdDelete)

module.exports = Router;



