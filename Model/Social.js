const mongoose = require("mongoose");

const socialSectionSchema = new mongoose.Schema(
    {
        website: {
            type: String,
            trim: true,
            required: [true, "Website is required."],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required."],
        },
        linkedin: {
            type: String,
            trim: true,
            required: [true, "LinkedIn profile is required."],
        },
        facebook: {
            type: String,
            trim: true,
            required: [true, "Facebook profile is required."],
        },
        github: {
            type: String,
            trim: true,
            required: [true, "GitHub profile is required."],
        },
        twitter: {
            type: String,
            trim: true,
            required: [true, "Twitter profile is required."],
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
