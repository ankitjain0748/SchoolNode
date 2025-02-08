const Blog = require('../Model/Gallery');
const catchAsync = require('../utill/catchAsync');
const Loggers = require('../utill/Loggers');


// Create a new blog post
exports.createBlog = catchAsync(async (req, res) => {
    try {
        const { title, content, Image, short_content } = req.body;
        const newBlog = new Blog({
            title,
            content,
            short_content,
            Image
        });
        await newBlog.save();
        res.status(201).json({
            status: true,
            message: "Gallery Success"
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
         const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure page is at least 1
            const limit = Math.max(parseInt(req.query.limit) || 50, 1); // Ensure limit is at least 1
            const skip = (page - 1) * limit;
            const totalUsers = await Blog.countDocuments({  });
            const totalPages = Math.ceil(totalUsers / limit);
        const blogs = await Blog.find();
        res.status(200).json({
            status: true,
            data: blogs,
            totalUsers,
            totalPages,
            currentPage: page,
            perPage: limit,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
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
                Loggers.warn("Blog ID is required")
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
        // if (!title || !content || !_id || !short_content) {
        //     Loggers.warn("All fields (title, content, Image , short_content) are required.")
        //     return res.status(400).json({
        //         status: false,
        //         message: "All fields (title, content, Image) are required.",
        //     });
        // }
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
                message: 'Gallery not found',
            });
        }
        res.status(200).json({
            status: true,
            data: blog,
            message: "Gallery Update"
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
            Loggers.warn("Blog ID is required")
            return res.status(400).json({
                status: false,
                message: 'Gallery ID is required.',
            });
        }
        await Blog.findByIdAndDelete(Id);

        res.status(200).json({
            status: true,
            message: 'gallery and associated images deleted successfully.',
        });
    } catch (error) {
        Loggers.error(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error. Please try again later.',
        });
    }
});


