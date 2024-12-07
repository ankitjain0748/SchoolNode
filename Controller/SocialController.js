const catchAsync = require("../utill/catchAsync");
const SocialSection = require("../Model/Social");

exports.socailAdd = catchAsync(async (req, res) => {
    const userId = req?.User?._id
    const {
        website,
        linkedin,
        github,
        facebook,
        twitter,
    } = req.body;
    const record = new SocialSection({
        website,
        linkedin,
        github,
        facebook,
        twitter,
        userId
    });

    const result = await record.save();
    if (result) {
        res.json({
            status: true,
            message: "Social has been successfully added!",
        });
    } else {
        res.json({
            status: false,
            error: result,
            message: "Failed to create package.",
        });
    }
});


