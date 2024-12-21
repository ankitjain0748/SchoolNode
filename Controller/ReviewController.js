const Review = require("../Model/Review");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Logger");

exports.ReviewAdd = catchAsync(async (req, res) => {
    try {
        const userId = req.User._id;
        if (userId) {
            return res.json({
                status: false,
                message: "User ID not found. "
            })
        }
        const { name, email, message, subject } = req.body();

        const reviewAdd = new Review({
            name: name,
            email: email,
            message: message,
            subject: subject,
            userId: userId
        });

        await reviewAdd.save();
        res.status(201).json({
            status: true,
            message: "Review Added Successfully"
        })
    } catch (error) {
        logger.error(error)
        console.log("erorr", error);
        res.json({
            status: false,
            message: "Failed to Add Review"
        })
    }
})


exports.ReviewGet = catchAsync(async (req, res) => {
    try {
        const review = await Review.find({});
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
        const { status, _id } = req.body();

        await Review.findByIdAndUpdate(_id, { status: status });
        res.json({
            status: true,
            message: "Review Status Updated Successfully"
        })
    } catch (error) {
        logger.error(error)
        res.json({
            status: false,
            message: "Failed to Update Review Status"
        })
    }
})