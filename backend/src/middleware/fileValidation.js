const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "..", "uploads");

// 🔒 GUARANTEE uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    fs.readdir(uploadDir, (err, files) => {
      // fallback if anything weird happens
      const count = err || !Array.isArray(files)
        ? 1
        : files.length + 1;
      cb(null, `painting_${count}${ext}`);
    });
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG/PNG images are allowed"), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB
  }
});
