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