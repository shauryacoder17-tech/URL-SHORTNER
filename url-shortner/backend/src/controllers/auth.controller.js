import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { compareValue, hashValue } from "../utils/hash.js";
import { sendVerificationCode } from "../utils/email.js";
import { signToken } from "../utils/jwt.js";
import { generateOtp } from "../utils/otp.js";

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

async function issueVerificationCode(user) {
  const code = generateOtp();
  await Otp.deleteMany({ email: user.email });
  await Otp.create({
    email: user.email,
    codeHash: await hashValue(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
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

  const passwordHash = await hashValue(password);
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

export async function verifyOtp(req, res) {
  const { email, code } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  const otp = await Otp.findOne({ email: normalizedEmail }).sort({
    createdAt: -1,
  });

  if (
    !user ||
    user.isVerified ||
    !otp ||
    otp.expiresAt < new Date() ||
    otp.attempts >= 5
  ) {
    return res
      .status(400)
      .json({ error: "Invalid or expired verification code." });
  }

  if (!(await compareValue(String(code), otp.codeHash))) {
    otp.attempts += 1;
    await otp.save();
    return res
      .status(400)
      .json({ error: "Invalid or expired verification code." });
  }

  user.isVerified = true;
  await user.save();
  await Otp.deleteMany({ email: normalizedEmail });

  return res.json({ token: signToken(user), user: publicUser(user) });
}

export async function resendOtp(req, res) {
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

  if (!user || !(await compareValue(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (!user.isVerified) {
    return res.status(403).json({ error: "Please verify your email first." });
  }

  return res.json({ token: signToken(user), user: publicUser(user) });
}

export function getCurrentUser(req, res) {
  return res.json({ user: req.user });
}
