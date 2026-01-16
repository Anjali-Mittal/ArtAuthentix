const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

/**
 * AUTH LIMITER (login / signup)
 * - Prefer email for auth abuse protection
 * - Fallback to IPv6-safe IP hashing
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    // Use email if provided (login/signup)
    if (req.body?.email) {
      return `email-${req.body.email}`;
    }

    // IPv6-safe fallback
    return ipKeyGenerator(req);
  },

  handler: (req, res) => {
    return res.status(429).render("signin", {
      error: "Too many login attempts. Please try again after 15 minutes.",
    });
  },
});

/**
 * UPLOAD LIMITER
 * - Purely IP-based
 * - IPv6 safe by default
 */
const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: ipKeyGenerator,

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
