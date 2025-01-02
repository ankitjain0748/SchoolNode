const mongoose = require("mongoose");

const socialSectionSchema = new mongoose.Schema(
    {
        website: {
            type: String,
            trim: true,
            // required: [true, "Website is required."],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        linkedin: {
            type: String,
            trim: true,
        },
        facebook: {
            type: String,
            trim: true,
        },
        github: {
            type: String,
            trim: true,
        },
        twitter: {
            type: String,
            trim: true,
        },
        created_at: {
            type: Date,
            required: [true, "Created at date is required."],
            default: Date.now,
        },
    },
);

const SocialSection = mongoose.model("SocialSection", socialSectionSchema);

module.exports = SocialSection;
