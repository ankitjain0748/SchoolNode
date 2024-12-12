const { signup, login, profile, verifyToken, updateUserStatus, resetpassword, UserListIdDelete, UserUpdate, forgotlinkrecord, forgotpassword, getCount, profilegettoken, userfilter, VerifyUser, UserIdDelete } = require("../Controller/AuthController");
const { BankAddOrEdit } = require("../Controller/BankController");
const {  ProfileData, ProfileDataId, profileAddOrUpdate } = require("../Controller/ProfileController");
const { SocialAddOrEdit } = require("../Controller/SocialController");

const userRoute = require("express").Router();


userRoute.post("/signup", signup)

userRoute.post("/login", login)

userRoute.get("/profile", profile)

userRoute.post("/updated_status", updateUserStatus)

userRoute.post("/forgot-password", forgotlinkrecord)

userRoute.post("/forgot", forgotpassword)

userRoute.post("/reset-password", verifyToken, resetpassword)

userRoute.post("/delete", verifyToken, UserListIdDelete)

userRoute.post("/update", verifyToken, UserUpdate)

userRoute.get("/all", getCount)

userRoute.get("/profile-token", verifyToken, profilegettoken)

userRoute.post("/verifyaccount", VerifyUser)

userRoute.post("/user-filter", userfilter);

userRoute.post("/delete" ,  UserIdDelete )


// Profile Manage
userRoute.post("/user-profile",verifyToken, profileAddOrUpdate);
userRoute.post("/profile-data"  , ProfileData)

userRoute.post("/profile_id" ,verifyToken , ProfileDataId)



// social icon 

userRoute.post("/user-social" ,verifyToken , SocialAddOrEdit)


// Bank 

userRoute.post("/bank-data" ,  verifyToken , BankAddOrEdit)




module.exports = userRoute;