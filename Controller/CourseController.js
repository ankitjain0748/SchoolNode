const Course = require("../Model/Course");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");



// Configure Multer for file uploads


// Course Post API
exports.CoursePost = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            discountPrice,
            duration,
            price,
            level,
            InstrutorId,
            courseImage,
            lectures,
        } = req.body;


        const record = new Course({
            title,
            description,
            category,
            duration,
            price,
            level,
            courseImage,
            discountPrice,
            InstrutorId,
            lectures: lectures, // Include lectures
        });

        const result = await record.save();

        if (result) {
            res.json({
                status: true,
                message: "Course Added Successfully!",
            });
        } else {
            res.status(400).json({
                status: false,
                message: "Failed to add course.",
            });
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            status: false,
            message: "Internal Server Error.",
        });
    }
};

// Middleware for handling file uploads


exports.CourseGet = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalCourse = await Course.countDocuments();

        const Courseget = await Course.find({})
            .sort({ createdAt: -1 })
            .populate('InstrutorId')  // Fetch related fields from Instructor
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalCourse / limit);

        res.status(200).json({
            data: {
                Courseget,
                totalCourse,
                totalPages,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            },
            msg: "Course Get",
        });
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            msg: "Failed to fetch Course get",
            error: error.message,
        });
    }
});



exports.CourseUpdate = catchAsync(async (req, res, next) => {
    try {
        const {
            _id, // Instructor ID
            title,
            description,
            category,
            duration,
            price,
            level,
            InstrutorId,
            courseImage,
            discountPrice,
            lectures
        } = req.body;

        if (!_id) {
            return res.status(400).json({
                status: false,
                message: "Instructor ID is required.",
            });
        }

        // const isValidObjectId = mongoose.Types.ObjectId.isValid(Id);
        // if (!isValidObjectId) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Invalid Instructor ID format.",
        //     });
        // }

        const updatedRecord = await Course.findByIdAndUpdate(
            _id,
            {
                title,
                discountPrice,
                description,
                category,
                duration,
                price,
                lectures,
                level,
                InstrutorId,
                courseImage
            },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "Instructor not found!",
            });
        }

        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "Instructor updated successfully.",
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the instructor. Please try again later.",
            error: error.message,
        });
    }
});


exports.CourseIdDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'CourseUpdate ID is required.',
            });
        }
        await Course.findByIdAndDelete(Id);

        res.status(200).json({
            status: true,
            message: 'CourseUpdate and associated images deleted successfully.',
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: 'Internal Server Error. Please try again later.',
        });
    }
});


exports.CourseGetId = catchAsync(async (req, res, next) => {
    try {
        // Extract ID from request parameters
        const { Id } = req.params; // Use params if it's part of the URL

        if (!Id) {
            return res.status(400).json({ msg: "Course ID is required" });
        }

        // Fetch the Course and populate Instructor data
        const CourseProfile = await Course.findById(Id).populate('InstrutorId'); // Fetch full Instructor data

        if (!CourseProfile) {
            return res.status(404).json({ msg: "Course not found" });
        }

        // Respond with the profile data
        res.status(200).json({
            data: CourseProfile,
            msg: "Course and Instructor details retrieved successfully",
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            msg: "Failed to fetch course profile",
            error: error.message,
        });
    }
});

