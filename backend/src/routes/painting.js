require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const isAuth = require("../middleware/authentication");
const { uploadLimiter } = require("../middleware/rateLimit");
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const Image = require("../models/image");

router.get("/upload", isAuth, (req, res) => {
  res.render("painting", {
    error: null
  });
});

router.post("/upload", isAuth, uploadLimiter,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.render("painting", {
          error: "Please upload a valid image file",
        });
      }

      // Uploading to Cloudinary
      const cloudRes = await cloudinary.uploader.upload_stream(
        { folder: "artauthentix" },
        async (err, result) => {
          if (err) {
            console.error(err);
            return res.render("painting", {
              error: "Image upload failed",
            });
          }

          const imageUrl = result.secure_url;

          // Sending URL to ML service
          const response = await fetch(
            `${process.env.ML_SERVICE_URL}/infer`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image_url: imageUrl }),
            }
          );
          const mlResult = await response.json();
          if (!mlResult.isPainting) {
            return res.render("painting", {
              error: "Uploaded image is not a painting",
            });
          }

          // 3Save to DB
          const image = new Image({
            userId: req.session.userId,
            imageUrl: imageUrl, // URL now
            publicId: result.public_id,
            predictions: mlResult.predictions,
          });

          await image.save();
          res.redirect(`/painting/${image._id}/results`);
        }
      );

      cloudRes.end(req.file.buffer); // push buffer
    } catch (err) {
      console.error(err);
      res.render("painting", {
        error: "Something went wrong while processing the image",
      });
    }
});


router.get("/:id/results",isAuth,
  async (req, res) => {
    try {
      const painting = await Image.findOne({
        _id: req.params.id,
      });
      if (!painting) {
        return res.status(404).render("error", {
          message: "Painting not found"
        });
      }
      res.render("results", {
        painting,
        predictions: painting.predictions,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        message: "Failed to load results"
      });
    }
  }
);

router.post("/:id/upvote", isAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const painting = await Image.findById(req.params.id);

    if (!painting) {
      return res.status(404).json({ error: "Painting not found" });
    }

    const alreadyUpvoted = painting.upvotedBy.includes(userId);

    if (alreadyUpvoted) {
      // REMOVE upvote
      painting.upvotedBy.pull(userId);
      painting.upvotes -= 1;
    } else {
      // ADD upvote
      painting.upvotedBy.push(userId);
      painting.upvotes += 1;
    }

    await painting.save();

    return res.json({
      upvotes: painting.upvotes,
      isUpvoted: !alreadyUpvoted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upvote failed" });
  }
});


router.delete("/:id", isAuth, async (req, res) => {
  try {
    const painting = await Image.findById(req.params.id);
    if (!painting) {
      return res.status(404).json({ error: "Painting not found" });
    }
    if (painting.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // DELETE FROM CLOUDINARY
    await cloudinary.uploader.destroy(painting.publicId);

    // DELETE FROM DB
    await painting.deleteOne();

    return res.json({ message: "Painting deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Deletion failed" });
  }
});

module.exports = router;