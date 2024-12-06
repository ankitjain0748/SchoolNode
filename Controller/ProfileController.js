const catchAsync = require("../utill/catchAsync");
const Profile = require("../Model/Profile")

exports.profileAdd = catchAsync(async (req, res) => {
    const userId = req?.User?._id
    const {
        firstname,
        lastname,
        username,
        phone_number,
        designation,
        bio,
    } = req.body;



    const record = new Profile({
        firstname,
        lastname,
        username,
        phone_number,
        designation,
        bio,
        userId

    });

    const result = await record.save();
    if (result) {
        res.json({
            status: true,
            message: "Profile has been successfully added!",
        });
    } else {
        res.json({
            status: false,
            error: result,
            message: "Failed to create package.",
        });
    }
});


exports.profile = catchAsync(async (req, res, next) => {
    try {
        const userId = req?.User?._id;
        const updatedUsers = await Profile.findOne({ userId: userId })
        const updatedSocials = await Social.findOne({ userId: userId })

        return res.status(200).json({
            status: true,
            user: updatedUsers,
            social: updatedSocials,
            message: "Users retrieved successfully with enquiry counts updated",
        });
    } catch (error) {
        console.error("Error fetching users and updating enquiry counts:", error); // Log full error for debugging
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching users and updating enquiry counts.",
            error: error.message || "Internal Server Error", // Provide a fallback error message
        });
    }
});
// exports.packageget = catchAsync(async (req, res, next) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const totalpackages = await packages.countDocuments();

//         const packagegetdata = await packages.find()
//             .sort({ created_at: -1 })
//             .skip(skip)
//             .limit(limit);

//         const totalPages = Math.ceil(totalpackages / limit);

//         res.status(200).json({
//             data: {
//                 packagegetdata: packagegetdata,
//                 totalpackages: totalpackages,
//                 totalPages: totalPages,
//                 currentPage: page,
//                 perPage: limit,
//                 nextPage: page < totalPages ? page + 1 : null,
//                 previousPage: page > 1 ? page - 1 : null,
//             },
//             msg: "Package data retrieved successfully",
//         });
//     } catch (error) {
//         res.status(500).json({
//             msg: "Error fetching package data",
//             error: error.message,
//         });
//     }
// });

// exports.packageStatusget = catchAsync(async (req, res, next) => {

//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//         const totalpackages = await packages.countDocuments();
//         const packagegetdata = await packages.find({ package_status: "active" }).sort({ created_at: -1 })
//             .skip(skip)
//             .limit(limit);
//         const totalPages = Math.ceil(totalpackages / limit);

//         res.status(200).json({
//             data: {
//                 packagegetdata: packagegetdata,
//                 totalpackages: totalpackages,
//                 totalPages: totalPages,
//                 currentPage: page,
//                 perPage: limit,
//                 nextPage: page < totalPages ? page + 1 : null,
//                 previousPage: page > 1 ? page - 1 : null,
//             },
//             msg: "Package data retrieved successfully",
//         });
//     } catch (error) {
//         res.status(500).json({
//             msg: "Error fetching package data",
//             error: error.message,
//         });
//     }
// });

// exports.PackageUpdate = catchAsync(async (req, res, next) => {
//     try {
//         const { Id, package_name,
//             package_description,

//             package_price_min, package_subtitle, image_filed, package_services, services_provider_phone, services_provider_name, services_provider_email, package_price_max, package_categories, package_status, package_image, package_duration, package_discount, package_people, package_availability, } = req.body;
//         if (!Id) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Package ID is required.",
//             });
//         }

//         const updatedRecord = await packages.findByIdAndUpdate(
//             Id,
//             { package_name, package_price_min, package_subtitle, fileId: image_filed, package_services, services_provider_phone, services_provider_name, services_provider_email, package_price_max, package_categories, package_description, package_status, package_image, package_duration, package_discount, package_people, package_availability, },
//             { new: true, runValidators: true }
//         );

//         if (!updatedRecord) {
//             return res.status(404).json({
//                 status: false,
//                 message: "packages not found!",
//             });
//         }
//         res.status(200).json({
//             status: true,
//             data: updatedRecord,
//             message: "packages updated successfully.",
//         });

//     } catch (error) {
//         console.error("Error updating packages record:", error);

//         res.status(500).json({
//             status: false,
//             message: "An error occurred while updating the packages. Please try again later.",
//             error: error.message,
//         });
//     }
// });

// exports.PackageUpdateStatus = catchAsync(async (req, res, next) => {
//     try {
//         const { Id } = req.body;

//         if (!Id) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Package ID is required.",
//             });
//         }

//         const packageRecord = await packages.findById(Id);

//         if (!packageRecord) {
//             return res.status(404).json({
//                 status: false,
//                 message: "Package not found!",
//             });
//         }

//         const newStatus = packageRecord.package_status === "active" ? "inactive" : "active";
//         const newavailability = packageRecord.package_availability === "available" ? "outOfStock" : "available";
//         const updatedRecord = await packages.findByIdAndUpdate(
//             Id,
//             {
//                 package_status: newStatus,
//                 package_availability: newavailability

//             },
//             { new: true, runValidators: true }
//         );

//         res.status(200).json({
//             status: true,
//             data: updatedRecord,
//             message: `Package status updated successfully to ${updatedRecord?.package_status}.`,
//         });

//     } catch (error) {
//         console.error("Error updating package record:", error);

//         res.status(500).json({
//             status: false,
//             message: "An error occurred while updating the package. Please try again later.",
//             error: error.message,
//         });
//     }
// });


// exports.PackagegetId = catchAsync(async (req, res, next) => {
//     try {
//         const { Id } = req.body;

//         if (!Id) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Package ID is required.",
//             });
//         }
//         // Fetch the current package record by ID
//         const packageRecord = await packages.findById(Id);

//         if (!packageRecord) {
//             return res.status(404).json({
//                 status: false,
//                 message: "Package not found!",
//             });
//         }

//         res.status(200).json({
//             status: true,
//             data: packageRecord,
//             message: `Package status updated successfully.`,
//         });

//     } catch (error) {
//         console.error("Error updating package record:", error);

//         res.status(500).json({
//             status: false,
//             message: "An error occurred while updating the package. Please try again later.",
//             error: error.message,
//         });
//     }
// });

// const b2 = new B2({
//     applicationKeyId: process.env.CLOUD_APPLICATION_ID, // Use environment variables for security
//     applicationKey: process.env.CLOUD_APPLICATION_KEY
// });

// async function deleteFile(fileName, fileId) {
//     try {
//         await b2.authorize();
//         const response = await b2.deleteFileVersion({
//             fileName: fileName,
//             fileId: fileId, // Ensure `fileId` is properly defined or passed
//         });
//         console.log('File deleted successfully:', response);
//         return true; // Indicate successful deletion
//     } catch (error) {
//         console.error('Error deleting file:', error);
//         return false; // Indicate failure
//     }
// }

// exports.PackageIdDelete = catchAsync(async (req, res, next) => {
//     try {
//         const { Id } = req.body;
//         if (!Id) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Package ID is required.',
//             });
//         }
//         // Find the package record first
//         const record = await packages.findById(Id);
//         if (!record) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Package not found.',
//             });
//         }

//         // Track deletion statuses
//         let allFilesDeleted = true;

//         // Delete associated images
//         if (record.package_image) {
//             const fileDeleted = await deleteFile(record.package_image.split('/').pop(), record?.fileId);
//             if (!fileDeleted) allFilesDeleted = false; // Mark as failed
//         }

//         if (record.package_services && record.package_services.length > 0) {
//             for (const service of record.package_services) {
//                 if (service.services_provider_image) {
//                     const fileDeleted = await deleteFile(service.services_provider_image.split('/').pop(), service.services_image_filed);
//                     if (!fileDeleted) allFilesDeleted = false; // Mark as failed
//                 }
//             }
//         }

//         // Abort deletion if any file failed to delete
//         if (!allFilesDeleted) {
//             return res.status(500).json({
//                 status: false,
//                 message: 'Failed to delete associated images. Package data remains intact.',
//             });
//         }

//         // Delete the package record
//         await packages.findByIdAndDelete(Id);

//         res.status(200).json({
//             status: true,
//             data: record,
//             message: 'Package and associated images deleted successfully.',
//         });
//     } catch (error) {
//         console.error('Error deleting package record:', error);
//         res.status(500).json({
//             status: false,
//             message: 'Internal Server Error. Please try again later.',
//         });
//     }
// });


// exports.deleteFileHandler = async (req, res) => { const { fileName, fileId } = req.body; try { if (!fileName || !fileId) { return res.status(400).json({ error: 'fileName and fileId are required' }); } await deleteFile(fileName, fileId); res.status(200).json({ message: 'File deleted successfully' }); } catch (error) { res.status(500).json({ error: 'Failed to delete file' }); } };