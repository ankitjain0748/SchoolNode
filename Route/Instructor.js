const Router = require("express").Router();
const { InstructorPost, InstructorGet, InstructorUpdate, InstructorIdDelete } = require("../Controller/Instructor");



Router.post("/instrutor", InstructorPost)

Router.get("/instrutor_get", InstructorGet)

Router.post("/instrutor_update", InstructorUpdate)

Router.post("/instrutor_delete", InstructorIdDelete)

module.exports = Router;



