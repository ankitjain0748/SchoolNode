const { signup, login, profile, verifyToken, updateUserStatus, resetpassword, UserListIdDelete, UserUpdate, forgotlinkrecord, forgotpassword, getCount, profilegettoken, userfilter, VerifyUser } = require("../Controller/AuthController");

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



module.exports = userRoute