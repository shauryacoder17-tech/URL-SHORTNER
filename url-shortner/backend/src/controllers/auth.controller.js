import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { sendVerificationCode } from "../utils/email.js";

const OTP_TTL_MS = 10 * 60 * 1000;

function createCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }

  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

async function issueVerificationCode(user) {
  const code = createCode();
  user.verificationCodeHash = hashCode(code);
  user.verificationCodeExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  await user.save();
  await sendVerificationCode(user.email, code);
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser?.isVerified) {
    return res
      .status(409)
      .json({ error: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = existingUser || new User({ email: normalizedEmail });
  user.name = name.trim();
  user.passwordHash = passwordHash;
  user.isVerified = false;

  await user.save();
  await issueVerificationCode(user);

  return res.status(201).json({
    message: "Verification code sent to your email.",
    email: user.email,
  });
}

export async function verifyEmail(req, res) {
  const { email, code } = req.body;
  const user = await User.findOne({
    email: email?.trim().toLowerCase(),
  }).select("+verificationCodeHash +verificationCodeExpiresAt");

  if (
    !user ||
    user.isVerified ||
    !user.verificationCodeHash ||
    !user.verificationCodeExpiresAt ||
    user.verificationCodeExpiresAt < new Date() ||
    hashCode(String(code)) !== user.verificationCodeHash
  ) {
    return res
      .status(400)
      .json({ error: "Invalid or expired verification code." });
  }

  user.isVerified = true;
  user.verificationCodeHash = undefined;
  user.verificationCodeExpiresAt = undefined;
  await user.save();

  return res.json({ token: createToken(user), user: publicUser(user) });
}

export async function resendVerificationCode(req, res) {
  const user = await User.findOne({
    email: req.body.email?.trim().toLowerCase(),
  });

  if (!user || user.isVerified) {
    return res.status(400).json({ error: "Unverified account not found." });
  }

  await issueVerificationCode(user);
  return res.json({ message: "A new verification code was sent." });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({
    email: email?.trim().toLowerCase(),
  }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (!user.isVerified) {
    return res.status(403).json({ error: "Please verify your email first." });
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
}

export function getCurrentUser(req, res) {
  return res.json({ user: req.user });
}
