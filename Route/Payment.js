const router = require("express").Router();
const { verifyToken } = require("../Controller/AuthController");
const { paymentAdd, createOrder, PaymentGet } = require("../Controller/PaymentController");


router.post("/create", createOrder);
router.post("/verify-payment", verifyToken ,paymentAdd);

router.get("/paymentget", PaymentGet);




module.exports = router;