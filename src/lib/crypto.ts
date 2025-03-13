import crypto from "crypto";

/**
 * Encrypts data using AES-256-GCM
 * @param data - Data to encrypt
 * @param key - Encryption key (must be 32 bytes for AES-256)
 * @returns Encrypted data as base64 string
 */
export function encrypt(data: string, key: string): string {
  // Ensure key is 32 bytes (256 bits)
  const normalizedKey = crypto.createHash("sha256").update(key).digest();

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", normalizedKey, iv);

  // Encrypt the data
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  // Combine IV, encrypted data, and auth tag into a single string
  // Format: base64(iv):base64(authTag):base64(encryptedData)
  return (
    Buffer.from(iv).toString("base64") +
    ":" +
    authTag.toString("base64") +
    ":" +
    encrypted
  );
}

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedData - Encrypted data from encrypt function
 * @param key - Encryption key (same as used for encryption)
 * @returns Decrypted data as string
 */
export function decrypt(encryptedData: string, key: string): string {
  // Split the encrypted data into its components
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivBase64, authTagBase64, encryptedBase64] = parts;

  // Convert components from base64
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  // Ensure key is 32 bytes (256 bits)
  const normalizedKey = crypto.createHash("sha256").update(key).digest();

  // Create decipher
  const decipher = crypto.createDecipheriv("aes-256-gcm", normalizedKey, iv);
  decipher.setAuthTag(authTag);

  // Decrypt the data
  let decrypted = decipher.update(encryptedBase64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
