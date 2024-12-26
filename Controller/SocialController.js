const catchAsync = require("../utill/catchAsync");
const SocialSection = require("../Model/Social");
const logger = require("../utill/Loggers");

exports.SocialAddOrEdit = catchAsync(async (req, res) => {
    const userId = req?.User?._id;
    if (!userId) {
        return res.status(400).json({
            status: false,
            message: "User ID is missing. Please log in and try again.",
        });
    }
    const { website, linkedin, github, facebook, twitter, _id } = req.body;
    if (!website && !linkedin && !github && !facebook && !twitter) {
        return res.status(400).json({
            status: false,
            message: "At least one social field (website, linkedin, github, facebook, twitter) is required.",
        });
    }
    try {
        let result;
        if (_id) {
            result = await SocialSection.findByIdAndUpdate(
                _id,
                { website, linkedin, github, facebook, twitter, userId },
                { new: true, runValidators: true }
            );
            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Social record not found.",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Social details have been successfully updated!",
                data: result,
            });
        } else {
            const record = new SocialSection({
                website,
                linkedin,
                github,
                facebook,
                twitter,
                userId,
            });
            result = await record.save();
            return res.status(201).json({
                status: true,
                message: "Social details have been successfully added!",
                data: result,
            });
        }
    } catch (error) {
        logger.error(error)
        return res.status(500).json({
            status: false,
            message: "Failed to process social details.",
            error: error.message,
        });
    }
});



