const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/authentication");
const { uploadLimiter } = require("../middleware/rateLimit");
const upload = require("../middleware/fileValidation");
const Image = require("../models/image");
const axios = require("axios");
const path = require("path");

router.get("/upload", isAuth, (req, res) => {
  res.render("painting", {
    error: null
  });
});

router.post(
  "/upload",
  isAuth,
  uploadLimiter,
  async (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err) {
        return res.render("painting", {
          error: err.message || "Invalid file upload"
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.render("painting", {
          error: "Please upload a valid image file"
        });
      }
      const image = new Image({
        userId: req.session.userId,
        imagePath: req.file.filename
      });

      await image.save();
      res.redirect("/");
    } catch (err) {
      res.render("painting", {
        error: "Something went wrong while uploading"
      });
    }
  }
);


module.exports = router;