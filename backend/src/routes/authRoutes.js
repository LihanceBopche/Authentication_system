const router = require("express").Router();
const controller = require("../controllers/authController");
const limiter = require("../middleware/rateLimiter");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", limiter, controller.register);
router.post("/login", limiter, controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", verifyToken, controller.logout);
router.post("/forgot-password-simple", controller.forgotPasswordSimple);

module.exports = router;