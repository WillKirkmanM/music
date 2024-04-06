import crypto from "crypto"
import argon2 from "argon2"

export default async function argonHash(password: string) {
  const salt = crypto.randomBytes(16)
  const hashedPassword = await argon2.hash(password, {
    salt,
    type: argon2.argon2id,
    memoryCost: 65536,
    parallelism: 2,
    hashLength: 64,
  }); 

  return hashedPassword
}