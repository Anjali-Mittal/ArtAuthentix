const express = require("express");
const fs = require("fs");
const router = express.Router();
const isAuth = require("../middleware/authentication");
const { uploadLimiter } = require("../middleware/rateLimit");
const upload = require("../middleware/fileValidation");
const Image = require("../models/image");
const path = require("path");

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Failed to delete file:", filePath, err.message);
  }
}


router.get("/upload", isAuth, (req, res) => {
  res.render("painting", {
    error: null
  });
});

router.post("/upload",isAuth,uploadLimiter,
  (req, res, next) => {
    upload.single("image")(req, res, err => {
      if (err) {
        return res.render("painting", {
          error: err.message
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

      // Absolute path to uploaded image
      const imagePath = path.join(
        process.cwd(), // backend/
        "uploads",
        req.file.filename
      );

      // ---- CALL ML SERVICE ----
      const response = await fetch(`${process.env.ML_SERVICE_URL}/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_path: imagePath })
      });

      const result = await response.json();

      // ---- NOT A PAINTING ----
      if (!result.isPainting) {
        safeUnlink(imagePath); // remove rejected file
        return res.render("painting", {
          error: "Uploaded image is not a painting"
        });
      }
      // ---- SAVE TO DB ----
      const image = new Image({
        userId: req.session.userId,
        imagePath: req.file.filename,
        predictions: result.predictions
      });
      await image.save();
      res.redirect(`/painting/${image._id}/results`);

    } catch (err) {
      console.error(err);
      // cleanup on crash
      if (req.file) {
        const imagePath = path.join(
          process.cwd(),
          "uploads",
          req.file.filename
        );
        fs.existsSync(imagePath) && safeUnlink(imagePath);
      }
      res.render("painting", {
        error: "Something went wrong while processing the image"
      });
    }
  }
);


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
  const painting = await Image.findById(req.params.id);
  if (!painting) return res.status(404).json({ error: "Not found" });

  if (painting.userId.toString() !== req.session.userId.toString()) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const imgPath = path.join(process.cwd(), "uploads", painting.imagePath);
  if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

  await painting.deleteOne();

  res.json({ message: "Painting deleted successfully" });
});

module.exports = router;