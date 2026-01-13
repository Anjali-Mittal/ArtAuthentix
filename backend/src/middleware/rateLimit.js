const rateLimit = require('express-rate-limit');

//Auth Limiter
const authLimiter = rateLimit({
    window: 15*60*1000,
    max: 10,
    message: "Too many attempts. Please try again after 15 minutes"
});

// Upload limiter: moderate
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 uploads
  message: "Too many uploads. Please slow down."
});

module.exports = {
  authLimiter,
  uploadLimiter
};