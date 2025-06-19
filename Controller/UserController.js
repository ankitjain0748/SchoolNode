const Blog = require("../Model/Blog");
const Course = require("../Model/Course");
const user = require("../Model/User");
const catchAsync = require("../utill/catchAsync");

exports.UserRefralfind = catchAsync(async (req, res) => {
    try {

        const refral_code = req.params.refral_code;
        if (!refral_code) {
            return res.status(400).json({
                status: false,
                message: "Referral code is required.",
            });
        }

        const UserData = await user.findOne({
            referral_code: refral_code
        }).select("name");

        res.status(200).json({
            status: true,
            message: "User fetched successfully",
            data: UserData,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching users and updating bank details.",
            error: error.message || "Internal Server Error", // Provide a fallback error message
        });
    }
}
);


exports.Courseslug = catchAsync(async (req, res, next) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({ msg: "Course slug is required" });
        }
        const CourseProfile = await Course.findOne({ slug: slug }).populate('InstrutorId'); // Fetch full Course data
        if (!CourseProfile) {
            return res.status(404).json({ msg: "Course not found" });
        }
        res.status(200).json({
            data: CourseProfile,
            msg: "Course and Course details retrieved successfully",
        });
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            msg: "Failed to fetch course profile",
            error: error.message,
        });
    }
});


exports.BlogSlug = catchAsync(async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({ msg: "Blog Slug is required" });
        }
        const blog = await Blog.findOne({ slug: slug });
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
});