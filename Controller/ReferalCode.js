const RefralModel = require("../Model/Referal");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/logger");

exports.RefralCodeAdd = catchAsync(async (req, res) => {
    try {
        console.log(req.body);
        const { referralCode, referred_by, referred_to } = req.body;
        const referral = new RefralModel({
            referralCode, referred_by, referred_to
        });
        await referral.save();
        res.json({
            msg: "Refral  Add ",
            status: true
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


exports.RefralCodeGet = catchAsync(async (
    req, res
) => {
    try {

        const referrals = await RefralModel.find();
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