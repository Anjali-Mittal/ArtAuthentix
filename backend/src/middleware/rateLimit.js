const rateLimit = require("express-rate-limit");

// Auth limiter (login/signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload limiter
const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.render("painting", {
      error: "Upload limit reached. Please try again later.",
    });
  },
});

module.exports = {
  authLimiter,
  uploadLimiter,
};
