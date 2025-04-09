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
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },

            // 🔍 Lookup from Profile table to get profile image
            {
                $lookup: {
                    from: "profiles", // Ensure the correct collection name
                    localField: "userId",
                    foreignField: "userId",
                    as: "profile"
                }
            },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } }, // Preserve if no profile exists

            {
                $lookup: {
                    from: "courses",
                    localField: "CourseId",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
            { $match: matchStage },

            {
                $project: {
                    _id: 1,
                    message: 1,
                    status: 1,
                    rating: 1,
                    created_at: 1,
                    "user.name": 1,
                    "user.email": 1,
                    "profile.profileImage": 1, // ✅ Get profile image from Profile table
                    "course.title": 1
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]).sort({ created_at: -1 });



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
        const review = await Review.find({ status: "read" }).sort({
            created_at
                : -1
        });
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
        const { CourseId, page = 1, limit = 10 } = req.body;
        if (!CourseId) {
            return res.status(400).json({
                status: false,
                message: "The field 'courseId' is required.",
            });
        }

        // Convert page and limit to numbers and ensure valid values
        const pageNumber = Math.max(1, parseInt(page, 10));
        const limitNumber = Math.max(1, parseInt(limit, 10));
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch paginated reviews
        const reviews = await Review.find({ CourseId, status: "read" })
            .skip(skip)
            .limit(limitNumber)
            .populate("userId", "name email"); // Optional: Populate user data

        // Get total number of reviews for the course
        const totalReviews = await Review.countDocuments({ CourseId, status: "read" });

        // Fetch profile data
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
                profile,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalReviews / limitNumber),
                totalReviews,
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

        const reviews = await Review.find({ userId }).populate("userId").sort({
            created_at
                : -1
        });
        const profile = await ProfileData.findOne({ userId }).populate("userId");
        const userdata = await User.findOne({ _id: userId });
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
                profile,
                userdata
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