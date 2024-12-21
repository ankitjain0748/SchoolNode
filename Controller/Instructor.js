const Instructor = require("../Model/Instructor");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Logger");

exports.InstructorPost = (async (req, res) => {
    const {
        firstName,
        lastName,
        designation,
        lessions,
        students,
        Skills,
        email,
        phoneNumber,
        address,
        profileImage,  // For profile image
        bio,            // For bio
        gender,         // Gender
        rating
    } = req.body;

    const record = new Instructor({
        firstName,
        lastName,
        designation,
        lessions,
        students,
        Skill: Skills,
        email,
        phoneNumber,
        address,
        profileImage,
        bio,
        gender,
        rating
    })
    const result = await record.save();
    if (result) {
        res.json({
            status: true,
            message: "Instructor Added Successfully!!.",
        });
    } else {
        logger.error(error)
        res.json({
            status: false,
            error: result,
            message: "Failed to Contact.",
        });
    }
});


exports.InstructorGet = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalInstructor = await Instructor.countDocuments();
        const Instructorget = await Instructor.find({}).sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const totalPages = Math.ceil(totalInstructor / limit);
        res.status(200).json({
            data: {
                Instructorget: Instructorget,
                totalInstructor: totalInstructor,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            },
            msg: "Instructorget Get",
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            msg: "Failed to fetch Instructorget get",
            error: error.message,
        });
    }
});


exports.InstructorUpdate = catchAsync(async (req, res, next) => {
    try {
        const {
            _id, // Instructor ID
            firstName,
            lastName,
            designation,
            lessions,
            students,
            Skill,
            email,
            phoneNumber,
            address,
            profileImage,
            bio,
            gender,
            rating,
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

        const updatedRecord = await Instructor.findByIdAndUpdate(
            _id,
            {
                firstName,
                lastName,
                designation,
                lessions,
                students,
                Skill,
                email,
                phoneNumber,
                address,
                profileImage,
                bio,
                gender,
                rating,
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


exports.InstructorIdDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'Instructor ID is required.',
            });
        }
        await Instructor.findByIdAndDelete(Id);

        res.status(200).json({
            status: true,
            message: 'Instructor and associated images deleted successfully.',
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: 'Internal Server Error. Please try again later.',
        });
    }
});


exports.InstructorGetId = catchAsync(async (req, res, next) => {
    try {
        // Extract ID from request parameters
        const { Id } = req.params; // Use params if it's part of the URL

        console.log("Id:", Id);
        if (!Id) {
            return res.status(400).json({ msg: "Instructor ID is required" });
        }

        // Fetch instructor profile from MongoDB
        const InstrutorProfile = await Instructor.findById(Id);
        if (!InstrutorProfile) {
            return res.status(404).json({ msg: "Instructor profile not found" });
        }

        // Respond with the profile data
        res.status(200).json({
            data: InstrutorProfile,
            msg: "Profile retrieved successfully",
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            msg: "Failed to fetch profile",
            error: error.message,
        });
    }
});
