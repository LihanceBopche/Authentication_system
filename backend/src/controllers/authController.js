const crypto = require("crypto");

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/tokenUtils");

exports.register = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, rows) => {
    if (rows.length > 0)
      return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (email, password) VALUES (?,?)",
      [email, hashed],
      () => res.json({ success: true, message: "Account created" })
    );
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, rows) => {
    if (rows.length === 0)
      return res.json({ success: false, message: "Invalid credentials" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.json({ success: false, message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    db.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES (?,?)",
      [user.id, refreshToken]
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict"
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict"
    });

    res.json({ success: true, email: user.email });
  });
};

exports.refresh = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.json({ success: false });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    db.query(
      "SELECT * FROM refresh_tokens WHERE token=?",
      [token],
      (err, rows) => {
        if (rows.length === 0)
          return res.json({ success: false, message: "Invalid refresh" });

        const accessToken = jwt.sign(
          { id: decoded.id },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("accessToken", accessToken, { httpOnly: true });

        res.json({ success: true });
      }
    );
  } catch {
    res.json({ success: false });
  }
};

exports.logout = (req, res) => {
  const token = req.cookies.refreshToken;

  db.query("DELETE FROM refresh_tokens WHERE token=?", [token]);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ success: true });
};

exports.forgotPasswordSimple = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword)
    return res.json({ success: false, message: "Missing fields" });

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, rows) => {
    if (rows.length === 0)
      return res.json({ success: false, message: "Email not registered" });

    const hashed = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password=? WHERE email=?",
      [hashed, email],
      () => res.json({ success: true, message: "Password updated successfully" })
    );
  });
};

