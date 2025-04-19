const { login, verifyToken, profilegettoken, getUsersWithMonthRefDate, userfilter, VerifyUser, OTP, VerifyOtp, getUsersWithTodayRefDate, UserListIds, ReSendOtp } = require("../Controller/AuthController");
const { updateUserStatus, UserUpdate, profile, UserPriceUpdate } = require("../Controller/UpdateUserController");
const { resetpassword, forgotlinkrecord, forgotpassword, UserListIdDelete, UserIdDelete } = require("../Controller/PasswordController");
const { BankAddOrEdit } = require("../Controller/BankController");
const { AdminDashboard, profileadmin, adminlogin, paymentdata } = require("../Controller/AdminDashboard");
const { ProfileData, ProfileDataId, profileAddOrUpdate, ProfileAdminPayeData } = require("../Controller/ProfileController");
const { SocialAddOrEdit } = require("../Controller/SocialController");
const userRoute = require("express").Router();

userRoute.post("/signup", OTP)
userRoute.post("/OTP", VerifyOtp)
userRoute.post("/login", login)
userRoute.post("/resendotp", ReSendOtp)
userRoute.get("/profile-token", verifyToken, profilegettoken)
// userRoute.get("/profile_Id", verifyToken, ProfileUserId)

userRoute.post("/verifyaccount", VerifyUser)
userRoute.post("/user-filter", userfilter);
userRoute.post("/profile-data", ProfileData)
userRoute.post("/profile_id", verifyToken, ProfileDataId)
userRoute.get('/referrals', getUsersWithTodayRefDate);
userRoute.get('/month_reffrals', getUsersWithMonthRefDate);

userRoute.get("/userlist", verifyToken, UserListIds);


// Bank And Soiclas profileAddOrUpdate controlerr 
userRoute.post("/user-social", verifyToken, SocialAddOrEdit)
userRoute.post("/bank-data", verifyToken, BankAddOrEdit)
userRoute.post("/user-profile", verifyToken, profileAddOrUpdate);

//PAssword  UserListIdDelete Controller 
userRoute.post("/reset-password", verifyToken, resetpassword);
userRoute.post("/forgot-password", forgotlinkrecord);
userRoute.post("/forgot", forgotpassword);
userRoute.post("/delete", UserIdDelete);
userRoute.post("/delete", verifyToken, UserListIdDelete)

//updateusercontroller 

userRoute.post("/updated_status", updateUserStatus)
userRoute.post("/update", verifyToken, UserUpdate)
userRoute.get("/profile", profile)
userRoute.post("/refral-active", verifyToken, UserPriceUpdate);


//AdminDashboard aand prfoile

userRoute.get('/admin_dashboard', verifyToken, AdminDashboard)
userRoute.post("/adminlogin", adminlogin)
userRoute.get("/adminprofile", profileadmin)
userRoute.get("/user_admin_payment", ProfileAdminPayeData)
userRoute.post("/payment", paymentdata);

module.exports = userRoute;