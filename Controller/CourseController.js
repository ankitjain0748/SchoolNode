const Course = require("../Model/Course");
const Online = require("../Model/Online");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");
const Webinar = require('../Model/Webniar'); // Import the model
const  Tranning = require("../Model/Video")
// Configure Multer for file uploads


// Course Post API
exports.CoursePost = async (req, res) => {
    try {
        const { title, description, courseVideo, sub_content, category, discountPrice, duration, price, level, InstrutorId, courseImage, lectures, Onlines, lectureFiles } = req.body;
        const record = new Course({
            title,
            description,
            category,
            duration,
            price,
            courseVideo,
            level,
            sub_content,
            courseImage,
            discountPrice,
            InstrutorId,
            lectureFiles,
            Onlines: Onlines,
            lectures: lectures, // Include lectures
        });
        const result = await record.save();
        if (result) {
            res.json({
                status: true,
                message: "Course Added Successfully!",
            });
        } else {
            logger.error("Failed to add course.")
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



exports.CourseGet = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalCourse = await Course.countDocuments();

        const Courseget = await Course.find({})
            .sort({ createdAt: -1 })
            .populate('InstrutorId')
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
            _id, // Course ID
            title,
            description,
            category,
            courseVideo,
            duration,
            price,
            lectureFiles,
            level,
            InstrutorId,
            courseImage,
            discountPrice,
            lectures,
            Onlines,
            sub_content
        } = req.body;

        if (!_id) {
            return res.status(400).json({
                status: false,
                message: "Course ID is required.",
            });
        }
        const updatedRecord = await Course.findByIdAndUpdate(
            _id,
            {
                title,
                sub_content,
                lectureFiles,
                discountPrice,
                description,
                category,
                duration,
                courseVideo,
                price,
                lectures,
                level,
                InstrutorId,
                Onlines,
                courseImage
            },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "Course not found!",
            });
        }

        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "Course updated successfully.",
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the Course. Please try again later.",
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
        const { Id } = req.params;
        if (!Id) {
            return res.status(400).json({ msg: "Course ID is required" });
        }
        const CourseProfile = await Course.findById(Id).populate('InstrutorId'); // Fetch full Course data
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

exports.onlinePost = async (req, res) => {
    try {
        const { title, content, video } = req.body;
        const record = new Online({
            title,
            content, video
        });
        const result = await record.save();
        if (result) {
            res.json({
                status: true,
                message: "Online Added Successfully!",
            });
        } else {
            logger.error("Failed to add Online.")
            res.status(400).json({
                status: false,
                message: "Failed to add Online.",
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

exports.OnlineGet = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const totalCourse = await Online.countDocuments();

        const Courseget = await Online.find({})
            .sort({ createdAt: -1 })
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

exports.onlineupdate = catchAsync(async (req, res) => {
    try {
        const {
            _id, // Course ID
            title,
            video, content
        } = req.body;

        if (!_id) {
            return res.status(400).json({
                status: false,
                message: "Course ID is required.",
            });
        }
        const updatedRecord = await Online.findByIdAndUpdate(
            _id,
            {
                title,
                video, content
            },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "Course not found!",
            });
        }

        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "Course updated successfully.",
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the Course. Please try again later.",
            error: error.message,
        });
    }
});

exports.OnlineIdDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'CourseUpdate ID is required.',
            });
        }
        await Online.findByIdAndDelete(Id);

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

exports.OnlineGetId = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.params;
        if (!Id) {
            return res.status(400).json({ msg: "Course ID is required" });
        }
        const CourseProfile = await Online.findById(Id); // Fetch full Course data
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


exports.CoursepriceUpdate = catchAsync(async (req, res, next) => {
    try {
        const {
            _id, // Course ID
            firstuser,
            seconduser,
            directuser,
            percentage_passive
        } = req.body;

        if (!_id) {
            return res.status(400).json({
                status: false,
                message: "Course ID is required.",
            });
        }
        const updatedRecord = await Course.findByIdAndUpdate(
            _id,
            {
                firstuser,
                seconduser,
                directuser,
                percentage_passive
            },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "Course not found!",
            });
        }

        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "Course updated successfully.",
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the Course. Please try again later.",
            error: error.message,
        });
    }
});

// webniar  Post



exports.Webniarpost = catchAsync(async (req, res) => {
        try {
            const { title, content, video ,webnair_date ,  place ,webnair_time  ,webniar_end_time} = req.body;
            const record = new Webinar({
                title,
                content, 
                video, 
                webniar_end_time,
                webnair_time,
                webnair_date , 
                place
            });
            const result = await record.save();
            if (result) {
                res.json({
                    status: true,
                    message: "Online Added Successfully!",
                });
            } else {
                logger.error("Failed to add Online.")
                res.status(400).json({
                    status: false,
                    message: "Failed to add Online.",
                });
            }
        } catch (error) {
            logger.error(error)
            res.status(500).json({
                status: false,
                message: "Internal Server Error.",
            });
        }
    }
);

exports.WebniarGet = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const totalCourse = await Webinar.countDocuments();

        const Courseget = await Webinar.find({})
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


exports.WebinarUpdate = catchAsync(async (req, res) => {
    try {
        const {
            _id,
            title,
            webnair_time,
            video,
            webniar_end_time,
            content,
            webnair_date ,  place
        } = req.body;

        if (!_id) {
            return res.status(400).json({
                status: false,
                message: "Webinar ID is required.",
            });
        }

        const updatedRecord = await Webinar.findByIdAndUpdate(
            _id,
            {
                title,
                video,
                webnair_time,
                webniar_end_time,
                webnair_date ,  place,
                content
            },
            { new: true, runValidators: true }
        );


        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "Webinar not found!",
            });
        }

        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "Webinar updated successfully.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the Webinar. Please try again later.",
            error: error.message,
        });
    }
});


exports.WebniarIdDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'CourseUpdate ID is required.',
            });
        }
        await Webinar.findByIdAndDelete(Id);

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

exports.WebniarGetId = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.params;
        if (!Id) {
            return res.status(400).json({ msg: "Course ID is required" });
        }
        const CourseProfile = await Webinar.findById(Id); // Fetch full Course data
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


//Tranning Video 



exports.Tranningpost = async (req, res) => {
    try {
        const { title, content, video ,webnair_date ,  place} = req.body;
        const record = new Tranning({
            title,
            content, video, 
            webnair_date ,  place
        });
        const result = await record.save();
        if (result) {
            res.json({
                status: true,
                message: "Online Added Successfully!",
            });
        } else {
            logger.error("Failed to add Online.")
            res.status(400).json({
                status: false,
                message: "Failed to add Online.",
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

exports.TranningGet = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const totalCourse = await Tranning.countDocuments();

        const Courseget = await Tranning.find({})
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


exports.tranningUpdate = catchAsync(async (req, res) => {
    try {
        const {
            _id,
            title,
            video,
            content,
            webnair_date ,  place
        } = req.body;

        if (!_id) {
            return res.status(400).json({
                status: false,
                message: "Webinar ID is required.",
            });
        }

        const updatedRecord = await Tranning.findByIdAndUpdate(
            _id,
            {
                title,
                video,
                webnair_date ,  place,
                content
            },
            { new: true, runValidators: true }
        );


        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "Webinar not found!",
            });
        }

        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "Webinar updated successfully.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the Webinar. Please try again later.",
            error: error.message,
        });
    }
});


exports.trannigIdDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'CourseUpdate ID is required.',
            });
        }
        await Tranning.findByIdAndDelete(Id);

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

exports.TranningGetId = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.params;
        if (!Id) {
            return res.status(400).json({ msg: "Course ID is required" });
        }
        const CourseProfile = await Tranning.findById(Id); // Fetch full Course data
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
