const router = require("express").Router();

const { verifyToken } = require("../Controller/AuthController");
const { RefralCodeDelete, RefralCodeAdd, RefralCodeGet ,RefralCodeGetId } = require("../Controller/ReferalCodeController");

router.post("/add_refral", verifyToken ,  RefralCodeAdd);

router.get("/get_refral_code",verifyToken, RefralCodeGet);

router.get("/get_refral", RefralCodeGetId);


router.delete("/delete_refral_code/:Id", RefralCodeDelete)

module.exports = router;