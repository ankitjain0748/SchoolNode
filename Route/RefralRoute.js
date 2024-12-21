const router = require("express").Router();

const { RefralCodeDelete, RefralCodeAdd, RefralCodeGet } = require("../Controller/ReferalCode");

router.post("/add_refral", RefralCodeAdd);

router.get("/get_refral_code", RefralCodeGet);

router.delete("/delete_refral_code/:Id", RefralCodeDelete)


module.exports = router;