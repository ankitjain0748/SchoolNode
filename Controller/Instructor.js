const Instructor = require("../Model/Instructor");


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
        Skills,
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
        res.status(500).json({
            msg: "Failed to fetch Instructorget get",
            error: error.message,
        });
    }
});


exports.InstructorUpdate = catchAsync(async (req, res, next) => {
    try {
        const { Id,   firstName,
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
            rating } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: "Package ID is required.",
            });
        }

        const updatedRecord = await packages.findByIdAndUpdate(
            Id,
            {   firstName,
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
                rating},
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                status: false,
                message: "packages not found!",
            });
        }
        res.status(200).json({
            status: true,
            data: updatedRecord,
            message: "packages updated successfully.",
        });

    } catch (error) {
        console.error("Error updating packages record:", error);

        res.status(500).json({
            status: false,
            message: "An error occurred while updating the packages. Please try again later.",
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
            data: record,
            message: 'Instructor and associated images deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting Instructor record:', error);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error. Please try again later.',
        });
    }
});
