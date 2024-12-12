const Instructor = require("../Model/Instructor");


exports.InstructorPost = (async (req, res) => {
    const { 
        firstName,
        lastName,
        designation,
        lessions,
        students,
        Skills,
        email,
        phoneNumber,
        address,
        profileImage,  // For profile image
        bio,            // For bio
        gender,         // Gender
        rating
     } = req.body;

    const record = new Instructor({
        firstName,
        lastName,
        designation,
        lessions,
        students,
        Skills,
        email,
        phoneNumber,
        address,
        profileImage,  
        bio,            
        gender,        
        rating
    })
    const result = await record.save();
    if (result) {
        res.json({
            status: true,
            message: "Instructor Added Successfully!!.",
        });
    } else {
        res.json({
            status: false,
            error: result,
            message: "Failed to Contact.",
        });
    }
});