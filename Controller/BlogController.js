const Blog = require('../Model/Blog');
const catchAsync = require('../utill/catchAsync');


// Create a new blog post
exports.createBlog = catchAsync(async (req, res) => {
  try {
    const { title, content, Image, short_content } = req.body;
    if (!title || !content || !short_content) {
      return res.status(400).json({
        status: false,
        message: "All fields (title, content, short content) are required.",
      });
    }

    const newBlog = new Blog({
      title,
      content,
      short_content,
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

    const { title, content, Image, _id, short_content } = req.body;
    // Validate required fields
    if (!title || !content || !_id) {
      return res.status(400).json({
        status: false,
        message: "All fields (title, content, Image) are required.",
      });
    }
    const blog = await Blog.findByIdAndUpdate(
      _id,
      { title, content, Image, short_content },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!blog) {
      return res.status(404).json({
        status: false,
        message: 'Blog not found',
      });
    }
    res.status(200).json({
      status: true,
      data: blog,
      message: "Bolg Update"
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
});


// Delete a blog post by ID
exports.BlogIdDelete = catchAsync(async (req, res, next) => {
  try {
    const { Id } = req.body;
    if (!Id) {
      return res.status(400).json({
        status: false,
        message: 'Blog ID is required.',
      });
    }
    await Blog.findByIdAndDelete(Id);

    res.status(200).json({
      status: true,
      message: 'Blog and associated images deleted successfully.',
    });
  } catch (error) {
    logger.error(error)

    res.status(500).json({
      status: false,
      message: 'Internal Server Error. Please try again later.',
    });
  }
});


