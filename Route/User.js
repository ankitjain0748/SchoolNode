const { login, profile, verifyToken, updateUserStatus, resetpassword, UserListIdDelete, UserUpdate, forgotlinkrecord, forgotpassword, getCount, profilegettoken, userfilter, VerifyUser, UserIdDelete, adminlogin, userupdateby, paymentdata, OTP, VerifyOtp, UserPriceUpdate, getUsersWithTodayRefDate, profileadmin, UserListIds } = require("../Controller/AuthController");
const { BankAddOrEdit } = require("../Controller/BankController");
const { ProfileData, ProfileDataId, profileAddOrUpdate } = require("../Controller/ProfileController");
const { SocialAddOrEdit } = require("../Controller/SocialController");
const userRoute = require("express").Router();

userRoute.post("/signup", OTP)

userRoute.post("/login", login)

userRoute.post("/adminlogin", adminlogin)


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

userRoute.post("/delete", UserIdDelete)


userRoute.post("/OTP", VerifyOtp)


// Profile Manage
userRoute.post("/user-profile", verifyToken, profileAddOrUpdate);
userRoute.post("/user-price", verifyToken, UserPriceUpdate);
userRoute.post("/profile-data", ProfileData)
userRoute.post("/profile_id", verifyToken, ProfileDataId)
userRoute.post("/widthrawal", userupdateby)
userRoute.post("/payment", paymentdata);
userRoute.get('/referrals', getUsersWithTodayRefDate);
// social icon 

userRoute.post("/user-social", verifyToken, SocialAddOrEdit)

userRoute.get("/adminprofile", profileadmin)

// Bank 

userRoute.post("/bank-data", verifyToken, BankAddOrEdit)

userRoute.get("/userlist", verifyToken, UserListIds)


module.exports = userRoute;