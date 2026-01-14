const rateLimit = require('express-rate-limit');

//Auth Limiter
const authLimiter = rateLimit({
    window: 15*60*1000,
    max: 10,
    message: "Too many attempts. Please try again after 15 minutes"
});

// Upload limiter: moderate
const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // uploads per window PER USER
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 🔑 Rate-limit by logged-in user, fallback to IP
    return req.session?.userId || req.ip;
  },
  handler: (req, res) => {
    return res.render("painting", {
      error: "Upload limit reached. Please try again later."
    });
  }
});

module.exports = {
  authLimiter,
  uploadLimiter
};