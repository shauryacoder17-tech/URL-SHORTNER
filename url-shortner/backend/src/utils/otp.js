import crypto from "node:crypto";

export function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}
