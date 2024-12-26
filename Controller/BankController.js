const catchAsync = require("../utill/catchAsync");
const Bank = require("../Model/Bank");
const logger = require("../utill/Loggers");
const { validationErrorResponse } = require("../utill/ErrorHandling");

exports.BankAddOrEdit = catchAsync(async (req, res) => {
    const userId = req?.User?._id;
    if (!userId) {
        logger.warn("User ID is missing. Please log in and try again.")
        return res.status(400).json({
            status: false,
            message: "User ID is missing. Please log in and try again.",
        });
    }
    const { BankName, BankNumber, BranchName, IFSC, _id } = req.body;
    
    if (!BankName || !BankNumber || !BranchName || !IFSC) {
        logger.warn("All fields (BankName, BankNumber, BranchName, IFSC) are required.")
        return res.status(400).json({
            status: false,
            message: "All fields (BankName, BankNumber, BranchName, IFSC) are required.",
        });
    }
    try {
        let result;
        if (_id) {
            // Edit existing record
            result = await Bank.findByIdAndUpdate(
                _id,
                { BankName, BankNumber, BranchName, IFSC, userId },
                { new: true, runValidators: true }
            );

            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Bank record not found.",
                });
            }

            return res.status(200).json({
                status: true,
                message: "Bank details have been successfully updated!",
                data: result,
            });
        } else {
            // Add new record
            const record = new Bank({
                BankName,
                BankNumber,
                BranchName,
                IFSC,
                userId,
            });

            result = await record.save();

            return res.status(201).json({
                status: true,
                message: "Bank details have been successfully added!",
                data: result,
            });
        }
    } catch (error) {
        logger.error(error)
        return res.status(500).json({
            status: false,
            message: "Failed to process bank details.",
            error: error.message,
        });
    }
});
