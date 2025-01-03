const RefralModel = require("../Model/Referal");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");

exports.RefralCodeAdd = catchAsync(async (req, res) => {
    const userId = req?.User?._id;
    try {
        const { referralCode, referred_by, referred_to } = req.body;
        if (!referralCode ) {
            logger.warn("All fields are required")
            return res.status(400).json({
                message: "All fields are required",
                status: false
            });
        };
        const referral = new RefralModel({
            referralCode, referred_by, referred_to, userId
        });
        const data = await referral.save();
        res.json({
            message: "Refral  Save",
            status: true,
            data: data
        })
    } catch (error) {
        logger.error(error);
        console.log("error", error)
        res.json({
            msg: "Refral  Add failed",
            status: false,
            error: error.message
        })
    }
});


exports.RefralCodeGet = catchAsync(async (req, res) => {
    try {
        const referrals = await RefralModel.find({});
        if (!referrals) {
            logger.warn("Refrals not found")
            return res.status(204).json({
                status: false,
                message: "No Refrals found",
                referrals: []
            });  // If no referral
        }
        res.json({
            msg: 'Refrals List',
            status: true,
            data: referrals
        })

    }
    catch {
        (error) => {
            logger.error(error);
            res.json(
                {
                    msg: 'Refral Failed',
                    status: false,
                    error: error.message
                }
            )
        }
    }
})


exports.RefralCodeDelete = catchAsync(async (req, res) => {
    try {
        const { Id } = req.params;
        const RefralDelete = await RefralModel.findByIdAndDelete({ _id: Id });
        res.json({
            status: true,
            data: RefralDelete,
            message: "Refral deleted successfully"
        })
    } catch (error) {
        logger.error(error);
        console.log("error", error)
        res.json({
            msg: "Refral  Failed ",
            status: false,
            error: error.message
        })

    }
})