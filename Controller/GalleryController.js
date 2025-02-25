const Gallery = require('../Model/Gallery');
const catchAsync = require('../utill/catchAsync');
const Loggers = require('../utill/Loggers');

// Create a new Gallery post
exports.createGallery = catchAsync(async (req, res) => {
    try {
        const { title, content, Image, short_content } = req.body;
        const newGallery = new Gallery({
            title,
            content,
            short_content,
            Image
        });
        await newGallery.save();
        res.status(201).json({
            status: true,
            message: "Gallery Success"
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
        });
    }
}
);
// Get all Gallery posts
exports.getAllGallerys = catchAsync(async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure page is at least 1
        const limit = Math.max(parseInt(req.query.limit) || 50, 1); // Ensure limit is at least 1
        const skip = (page - 1) * limit;
        const search = req.query.search ? String(req.query.search).trim() : ""; // Ensure search is a string
        let query = {};

        if (search !== "") {
            query = { title: { $regex: new RegExp(search, "i") } }; // Use RegExp constructor
        }
        const totalUsers = await Gallery.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);
        const Gallerys = await Gallery.find(query);
        res.status(200).json({
            status: true,
            data: Gallerys,
            totalUsers,
            totalPages,
            currentPage: page,
            perPage: limit,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
        });
    }
});
// Get a single Gallery post by ID
exports.getGalleryById = catchAsync(async (req, res) => {
        try {
            const { Id } = req.params;
            if (!Id) {
                Loggers.warn("Gallery ID is required")
                return res.status(400).json({ msg: "Gallery ID is required" });
            }
            const Gallerys = await Gallery.findById(Id);
            if (!Gallerys) {
                return res.status(404).json({
                    status: false,
                    message: 'Gallery not found',
                });
            }
            res.status(200).json({
                status: true,
                data: Gallerys,
                message: 'Gallery fetched successfully',
            });
        } catch (error) {
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }
    }
);
// Update a Gallery post by ID
exports.updateGalleryById = catchAsync(async (req, res) => {
    try {

        const { title, content, Image, _id, short_content } = req.body;
        // Validate required fields
        // if (!title || !content || !_id || !short_content) {
        //     Loggers.warn("All fields (title, content, Image , short_content) are required.")
        //     return res.status(400).json({
        //         status: false,
        //         message: "All fields (title, content, Image) are required.",
        //     });
        // }
        const Gallerys = await Gallery.findByIdAndUpdate(
            _id,
            { title, content, Image, short_content },
            {
                new: true,
                runValidators: true,
            }
        );
        if (!Gallerys) {
            return res.status(404).json({
                status: false,
                message: 'Gallery not found',
            });
        }
        res.status(200).json({
            status: true,
            data: Gallerys,
            message: "Gallery Update"
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
        });
    }
});
// Delete a Gallery post by ID
exports.GalleryIdDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            Loggers.warn("Gallery ID is required")
            return res.status(400).json({
                status: false,
                message: 'Gallery ID is required.',
            });
        }
        await Gallery.findByIdAndDelete(Id);

        res.status(200).json({
            status: true,
            message: 'gallery and associated images deleted successfully.',
        });
    } catch (error) {
        Loggers.error(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error. Please try again later.',
        });
    }
});
