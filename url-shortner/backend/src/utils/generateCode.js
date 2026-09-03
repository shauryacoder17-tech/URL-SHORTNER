import { customAlphabet } from "nanoid";

const alphabet = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 7);

export function generateShortCode() {
  return nanoid();
}
