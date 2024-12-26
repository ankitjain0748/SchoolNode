const subscribemodal = require("../Model/Subscribe");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");


exports.SubscribePost = catchAsync(async (req, res) => {
    try {
        const { email } = req.body;
        const record = new subscribemodal({ email });
        const result = await record.save();
        if (result) {
            res.json({
                status: true,
                message: "Request Sent Successfully!!.",
            });
        } else {
            logger.info(result)
            res.json({
                status: false,
                error: result,
                message: "Failed to Contact.",
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: "Failed to Subscribe",
            error: error.message,
        });
    }
});

exports.Subscribeget = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalsubscribemodal = await subscribemodal.countDocuments();
        const subscribedata = await subscribemodal.find({}).sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const totalPages = Math.ceil(totalsubscribemodal / limit);

        res.status(200).json({
            data: {
                subscribedata: subscribedata,
                totalsubscribemodal: totalsubscribemodal,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            },
            message: "Subscribe Get",
        });
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            message: "Failed to fetch Subscribe get",
            error: error.message,
        });
    }
});

