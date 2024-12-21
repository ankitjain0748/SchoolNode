const express = require('express');
const blogController = require('../Controller/BlogController');

const router = express.Router();

router.post("/create", blogController.createBlog)

router.get("/get", blogController.getAllBlogs)

router.get("/get/:id", blogController.getBlogById)

router.put("/update/:id", blogController.updateBlogById)

router.delete("/delete/:id", blogController.deleteBlogById)

module.exports = router;
