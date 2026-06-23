const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const { setAuthCookie, clearAuthCookie, setCsrfCookie, clearCsrfCookie } = require('../utils/cookie');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    setAuthCookie(res, token);
    const csrfToken = setCsrfCookie(res);
    res.status(201).json({
      success: true,
      token,
      csrfToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    setAuthCookie(res, token);
    const csrfToken = setCsrfCookie(res);
    res.json({
      success: true,
      token,
      csrfToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar, isVerified: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }
    const token = generateToken(user._id);
    setAuthCookie(res, token);
    const csrfToken = setCsrfCookie(res);
    res.json({
      success: true,
      token,
      csrfToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Always respond the same way whether or not the account exists —
    // otherwise this endpoint becomes an email-enumeration oracle.
    const genericResponse = {
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    };
    if (!user) return res.json(genericResponse);

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'EncoreHub Password Reset',
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#E50914">EncoreHub Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#E50914;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin:16px 0">Reset Password</a>
          <p style="color:#666;font-size:12px">If you didn't request this, please ignore this email.</p>
        </div>`,
      });
    } catch (emailErr) {
      // Don't leak email-sending failures to the client either — log
      // server-side and still return the generic response.
      console.error('Failed to send reset email:', emailErr.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = generateToken(user._id);
    setAuthCookie(res, token);
    const csrfToken = setCsrfCookie(res);
    res.json({ success: true, token, csrfToken, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.json({ success: true, message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  // Self-heal: a session that predates CSRF protection (or one where the
  // browser cleared the readable csrfToken cookie but kept the httpOnly auth
  // cookie) won't have a CSRF cookie yet. Re-issue one here so the user isn't
  // stuck unable to perform any mutating action until they log out and back in.
  let csrfToken = req.cookies?.csrfToken;
  if (!csrfToken) {
    csrfToken = setCsrfCookie(res);
  }
  res.json({ success: true, user, csrfToken });
};
