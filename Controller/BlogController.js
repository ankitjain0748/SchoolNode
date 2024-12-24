const Blog = require('../Model/Blog');
const catchAsync = require('../utill/catchAsync');


// Create a new blog post
exports.createBlog = catchAsync( async (req, res) => {
    try {
      const { title, content, Image } = req.body;
      if (!title || !content) {
        return res.status(400).json({
          status: false,
          message: "All fields (title, content, Image) are required.",
        });
      }
      const newBlog = new Blog({
        title,
        content,
        Image
      });
      await newBlog.save();
      res.status(201).json({
        status: true,
        message: "Blog Success"
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }
);


// Get all blog posts
exports.getAllBlogs = catchAsync(async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({
      status: true,
      data: blogs
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
});

// Get a single blog post by ID
exports.getBlogById = catchAsync(
  async (req, res) => {
    try {
      const { Id } = req.params;
      if (!Id) {
        return res.status(400).json({ msg: "Blog ID is required" });
      }
      const blog = await Blog.findById(Id);
      if (!blog) {
        return res.status(404).json({
          status: false,
          message: 'Blog not found',
        });
      }
      res.status(200).json({
        status: true,
        data: blog,
        message: 'Blog fetched successfully',
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }
);

// Update a blog post by ID
exports.updateBlogById = catchAsync(async (req, res) => {
  try {
    const { Id } = req.params;
    console.log("Id:", Id);

    // Check if the Blog ID is provided
    if (!Id) {
      return res.status(400).json({ msg: "Blog ID is required" });
    }

    const { title, content, Image } = req.body;

    // Validate required fields
    if (!title || !content || !Image) {
      return res.status(400).json({
        status: false,
        message: "All fields (title, content, Image) are required.",
      });
    }

    // Update the blog using correct syntax
    const blog = await Blog.findByIdAndUpdate(
      Id,
      { title, content, Image }, // Pass an object with the updated fields
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation is run
      }
    );

    // Handle case where blog is not found
    if (!blog) {
      return res.status(404).json({
        status: false,
        message: 'Blog not found',
      });
    }

    // Send successful response
    res.status(200).json({
      status: true,
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
});


// Delete a blog post by ID
exports.deleteBlogById = catchAsync(async (req, res) => {
  try {
    const { Id } = req.params;
    if (!Id) {
      return res.status(400).json({ msg: "Blog ID is required" });
    }

    if (!Id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: "Invalid Blog ID format" });
    }

    // Attempt to delete the blog
    const blog = await Blog.findByIdAndDelete(Id);

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    // Return success response
    res.status(200).json({
      status: true,
      message: "Blog deleted successfully",
      data: null,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

