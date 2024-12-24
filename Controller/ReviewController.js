const Review = require("../Model/Review");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");
exports.ReviewAdd = catchAsync(async (req, res) => {
    try {
        const userId = req.User?._id;
        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "User ID not found. Please log in again.",
            });
        }

        const { name, email, message, subject, courseId } = req.body;
        if (!name || !email || !message || !subject || !courseId) {
            return res.status(400).json({
                status: false,
                message: "All fields (name, email, message, subject, courseId) are required.",
            });
        }

        const reviewAdd = new Review({
            name,
            email,
            message,
            subject,
            userId,
            courseId,
        });

        await reviewAdd.save();
        res.status(201).json({
            status: true,
            message: "Review added successfully.",
        });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({
            status: false,
            message: "Failed to add review. Please try again later.",
        });
    }
});



exports.ReviewGet = catchAsync(async (req, res) => {
    try {
        const review = await Review.find({}).populate('userId').populate('courseId')  ;
        res.json({
            status: true,
            message: "Review fetched Successfully",
            review
        })
    } catch (error) {
        logger.error(error)

        console.log("erorr", error);
        res.json({
            status: false,
            message: "Failed to Fetch Review"
        })
    }
});

exports.ReviewGetStatus = catchAsync(async (req, res) => {
    try {
        const review = await Review.find({ status: "read" });
        res.json({
            status: true,
            message: "Review fetched Successfully",
            review
        })
    } catch (error) {
        logger.error(error)
        console.log("erorr", error);
        res.json({
            status: false,
            message: "Failed to Fetch Review"
        })
    }
});


exports.ReviewDelete = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;

        await Review.findByIdAndDelete(id);
        res.json({
            status: true,
            message: "Review Deleted Successfully"
        })

    } catch (error) {

        logger.error(error)
        console.log("erorr", error);
        res.json({
            status: false,
            message: "Failed to Delete Review"
        })
    }
})


exports.ReviewStatus = catchAsync(async (req, res) => {
    try {
        console.log("req.body", req.body);

        const { status, _id } = req.body; // Correct destructuring
        if (!_id || !status) {
            return res.json({
                status: false,
                message: "Invalid input: _id or status is missing",
            });
        }

        const data = await Review.findByIdAndUpdate(
            _id,
            { status: status },
            { new: true } // Option to return updated document
        );

        if (!data) {
            return res.json({
                status: false,
                message: "Review not found or failed to update",
            });
        }

        console.log("data", data); // Correct console.log
        res.json({
            status: true,
            message: "Review Status Updated Successfully",
        });
    } catch (error) {
        logger.error(error);
        console.log("error", error); // Log the error for debugging
        res.json({
            status: false,
            message: "Failed to Update Review Status",
        });
    }
});


exports.ReviewCourse = catchAsync(async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                status: false,
                message: "All fields (name, email, message, subject, courseId) are required.",
            });
        }

        // Fetch data and populate fields
        const data = await Review.findOne({ courseId })
            .populate("courseId")
            .populate("userId");

        if (!data) {
            return res.status(404).json({
                status: false,
                message: "No review found for the provided courseId.",
            });
        }

        console.log("Data retrieved:", {
            userId: data.userId?._id,
            courseId: data.courseId?._id,
        });

        // Send successful response
        res.status(201).json({
            status: true,
            data: data, // You can sanitize this if needed to exclude private fields
        });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({
            status: false,
            message: "Failed to add review. Please try again later.",
        });
    }
});
