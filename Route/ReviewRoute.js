const router = require("express").Router();
const { verifyToken } = require("../Controller/AuthController");
const { ReviewAdd, ReviewGet, ReviewGetStatus, ReviewDelete, ReviewStatus } = require("../Controller/ReviewController");




router.post("/review_add" , verifyToken, ReviewAdd);


router.get("/review_get" , ReviewGet);

router.get("/reivew_get_status"  , ReviewGetStatus)

router.delete("/reivew_delete/:Id" , ReviewDelete)

router.post("/review_status"  , ReviewStatus)



module.exports = router;