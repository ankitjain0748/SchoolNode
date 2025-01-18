// webniar  Post

const VideoTraning = require("../Model/Video");



exports.VideoTraningpost = async (req, res) => {
    try {
        const { title, content, video, webnair_date, place } = req.body;
        const record = new VideoTraning({
            title,
            content, video,
            webnair_date, place
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

exports.VideoTraningGet = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const totalCourse = await VideoTraning.countDocuments();

        const Courseget = await VideoTraning.find({})
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


exports.VideoTraningUpdate = catchAsync(async (req, res) => {
    try {
        const {
            _id,
            title,
            video,
            content,
            webnair_date, place
        } = req.body;

        if (!_id) {
            return res.status(400).json({
                status: false,
                message: "VideoTraning ID is required.",
            });
        }

        const updatedRecord = await VideoTraning.findByIdAndUpdate(
            _id,
            {
                title,
                video,
                webnair_date, place,
                content
            },
            { new: true, runValidators: true }
        );


        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "VideoTraning not found!",
            });
        }

        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "VideoTraning updated successfully.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the VideoTraning. Please try again later.",
            error: error.message,
        });
    }
});


exports.VideoTraningIdDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'CourseUpdate ID is required.',
            });
        }
        await VideoTraning.findByIdAndDelete(Id);

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

exports.VideoTraningGetId = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.params;
        if (!Id) {
            return res.status(400).json({ msg: "Course ID is required" });
        }
        const VideoTraning = await VideoTraning.findById(Id); // Fetch full Course data
        if (!VideoTraning) {
            return res.status(404).json({ msg: "Course not found" });
        }
        res.status(200).json({
            data: VideoTraning,
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
