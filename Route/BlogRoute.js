const express = require('express');
const blogController = require('../Controller/BlogController');

const router = express.Router();

router.post("/create", blogController.createBlog)

router.get("/get", blogController.getAllBlogs)

router.get("/get/:Id", blogController.getBlogById)

router.post("/update/:Id", blogController.updateBlogById)

router.delete("/delete/:Id", blogController.deleteBlogById)

module.exports = router;
