const Review = require("../Model/Review");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");
const User = require("../Model/User");
const ProfileData = require("../Model/Profile");

exports.ReviewAdd = catchAsync(async (req, res) => {
    try {
        const userId = req.User?._id;
        if (!userId) {
            logger.warn("User ID not found. Please log in again.");
            return res.status(400).json({
                status: false,
                message: "User ID not found. Please log in again.",
            });
        }

        // Fetch user details including courseId
        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({
                status: false,
                message: "User not found.",
            });
        }

        // Extract courseId from user data
        const { CourseId } = userData;
        if (!CourseId) {
            return res.status(400).json({
                status: false,
                message: "User is not enrolled in any course.",
            });
        }

        // Extract review details from request body
        const { message, rating } = req.body;

        // Create new review
        const reviewAdd = new Review({
            message,
            userId,
            CourseId,
            rating
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
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 50, 1);
        const skip = (page - 1) * limit;
        const search = req.query.search ? String(req.query.search).trim() : "";

        let matchStage = {};
        if (search !== "") {
            matchStage = {
                "user.name": { $regex: new RegExp(search, "i") } // user.name पर सर्च
            };
        }

        const totalUsers = await Review.aggregate([
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $match: matchStage },
            { $count: "totalUsers" }
        ]);

        const totalRecords = totalUsers.length > 0 ? totalUsers[0].totalUsers : 0;
        const totalPages = Math.ceil(totalRecords / limit);

        const reviews = await Review.aggregate([
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $lookup: { from: "courses", localField: "CourseId", foreignField: "_id", as: "course" } },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
            { $match: matchStage },
            { $project: { 
                _id: 1, 
                reviewText: 1, 
                rating: 1, 
                createdAt: 1,
                "user.name": 1, 
                "user.email": 1, 
                "user.image": 1, 
                "course.title": 1 
            }},
            { $skip: skip },
            { $limit: limit }
        ]);

        res.json({
            status: true,
            message: "Review fetched successfully",
            reviews,
            totalUsers: totalRecords,
            totalPages,
            currentPage: page,
            perPage: limit,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
        });
    } catch (error) {
        logger.error(error);
        console.log("Error:", error);
        res.json({
            status: false,
            message: "Failed to fetch reviews"
        });
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

        const { status, _id } = req.body; // Correct destructuring
        if (!_id || !status) {
            logger.warn("Invalid input: _id or status is missing")
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
        const userId = req.User._id
        const { CourseId } = req.body;

        // Validate courseId
        if (!CourseId) {
            return res.status(400).json({
                status: false,
                message: "The field 'courseId' is required.",
            });
        }

        // Fetch reviews with populated references
        const reviews = await Review.find({
            CourseId, status: "read"
        })
        const profile = await ProfileData.findOne().populate("userId");
        if (!reviews.length) {
            return res.status(404).json({
                status: false,
                message: "No reviews found for the provided courseId.",
            });
        }

        // Respond with fetched data
        return res.status(200).json({
            status: true,
            data: {
                reviews,
                profile
            },
            message: "Reviews fetched successfully.",
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching reviews. Please try again later.",
        });
    }
});

exports.ReviewCourseUser = catchAsync(async (req, res) => {
    try {

        const userId = req?.User?._id
        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "All fields (name, email, message, subject, courseId) are required.",
            });
        }

        const reviews = await Review.find({ userId }).populate("userId");

        const profile = await ProfileData.findOne().populate("userId");

        if (!reviews) {

            return res.status(404).json({
                status: false,
                message: "No review found for the provided courseId.",
            });
        }
        res.status(201).json({
            status: true,
            data: {
                reviews,
                profile
            },
            message: "Review fetched successfully for the provided courseId.",
        });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({
            status: false,
            message: "Failed to add review. Please try again later.",
        });
    }
});