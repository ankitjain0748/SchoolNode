const router = require("express").Router();
const { verifyToken } = require("../Controller/AuthController");
const { paymentAdd, createOrder, PaymentGet } = require("../Controller/PaymentController");

router.post("/verify-payment", verifyToken ,paymentAdd);

router.post("/create", createOrder);

router.get("/paymentget", PaymentGet);




module.exports = router;