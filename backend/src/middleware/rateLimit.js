const rateLimit = require("express-rate-limit");

// Auth limiter (login/signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    // Prefer email during login attempts
    return req.body?.email || req.ip;
  },

  handler: (req, res) => {
    return res.status(429).render("signin", {
      error: "Too many login attempts. Please try again after 15 minutes."
    });
  }
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
