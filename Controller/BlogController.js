const Blog = require('../Model/Blog');


// Create a new blog post
exports.createBlog = async (req, res) => {
  try {
    const newBlog = new Blog(req.body);  // This should now work correctly
    await newBlog.save();
    res.status(201).json({
      status: 'success',
      message: "Blog Success"
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};


// Get all blog posts
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({
      status: 'success',
      results: blogs.length,
      data: {
        blogs,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get a single blog post by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        status: 'fail',
        message: 'Blog not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        blog,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a blog post by ID
exports.updateBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!blog) {
      return res.status(404).json({
        status: 'fail',
        message: 'Blog not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        blog,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a blog post by ID
exports.deleteBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({
        status: 'fail',
        message: 'Blog not found',
      });
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
