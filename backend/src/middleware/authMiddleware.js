const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token)
    return res.json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.json({ success: false, message: "Invalid Token" });
  }
};

exports.verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.json({ success: false, message: "Admin only" });

  next();
};