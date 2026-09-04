import bcrypt from "bcryptjs";

export function hashValue(value) {
  return bcrypt.hash(value, 12);
}

export function compareValue(value, hash) {
  return bcrypt.compare(value, hash);
}
