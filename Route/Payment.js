const router = require("express").Router();
const { verifyToken } = require("../Controller/AuthController");
const { paymentAdd, createOrder, PaymentGet, PaymentGetCourse, PaymentGetdata, paymentdata, PaymentGetCourseId } = require("../Controller/PaymentController");

router.post("/create", createOrder);

router.post("/verify-payment", verifyToken, paymentAdd);

router.get("/paymentget", PaymentGet);

router.get("/admin/get", PaymentGetdata);


router.get("/payment_get", verifyToken, PaymentGetCourse)

router.get("/user_payment", verifyToken, paymentdata)

router.get("/payment_course", verifyToken, PaymentGetCourseId)


module.exports = router;


