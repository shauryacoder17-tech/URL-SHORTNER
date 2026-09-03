import { Url } from "../models/Url.js";
import { generateShortCode } from "../utils/generateCode.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function shortenUrl(req, res) {
  const { originalUrl } = req.body;

  if (!originalUrl || !isValidUrl(originalUrl)) {
    return res.status(400).json({ error: "A valid originalUrl is required." });
  }

  let shortCode;
  let existing = true;

  while (existing) {
    shortCode = generateShortCode();
    existing = await Url.findOne({ shortCode });
  }

  const url = await Url.create({ originalUrl, shortCode });

  return res.status(201).json({
    shortUrl: `${BASE_URL}/${url.shortCode}`,
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
  });
}

export async function redirectToOriginal(req, res) {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode });

  if (!url) {
    return res.status(404).json({ error: "Short URL not found." });
  }

  if (url.expiresAt && url.expiresAt < new Date()) {
    return res.status(410).json({ error: "This short URL has expired." });
  }

  url.clicks += 1;
  await url.save();

  return res.redirect(url.originalUrl);
}
