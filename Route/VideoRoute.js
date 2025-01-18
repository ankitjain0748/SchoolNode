const  VideoTraningController =  require("../Controller/TranningVideocontroller");


const router = require('express').Router();


router.post("/video_traning_add", VideoTraningController.VideoTraningpost);

router.get("/video_traning_get", VideoTraningController.Videot);

router.get("/video_traning_get_by_id/:id", VideoTraningController.VideoTraninggetById);

router.put("/video_traning_update/:id", VideoTraningController.VideoTraningUpdate);

router.delete("/video_traning_delete/:id", VideoTraningController.VideoTraningDelete);