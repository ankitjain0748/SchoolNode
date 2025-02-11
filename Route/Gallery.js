const express = require('express');
const GalleryController = require('../Controller/GalleryController');

const router = express.Router();

router.post("/create", GalleryController.createGallery)

router.get("/get", GalleryController.getAllGallerys)

router.get("/get/:Id", GalleryController.getGalleryById)

router.post("/update", GalleryController.updateGalleryById)

router.post("/delete", GalleryController.GalleryIdDelete)

module.exports = router;
