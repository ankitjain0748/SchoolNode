const { adminlogin, AdminDashboard, profileadmin } = require("../Controller/AdminDashboardController");
const { verifyToken, profilegettoken } = require("../Controller/AuthController");
const { payoutData } = require("../Controller/payoutController");
const { ProfileAdminPayeData } = require("../Controller/ProfileController");
const { ContactPost, ContactGet, ContactDelete } = require("../Controller/ContactController");

const adminRoute = require("express").Router();

adminRoute.post("/login", adminlogin);
adminRoute.get('/dashboard', verifyToken, AdminDashboard)
adminRoute.get("/profile", profileadmin)
adminRoute.get("/admin_payment", ProfileAdminPayeData)
adminRoute.post("/payment", payoutData);
adminRoute.get("/token", verifyToken, profilegettoken)




module.exports = adminRoute;