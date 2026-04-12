import crypto from 'crypto';

// HKDF context label — changing this rotates all encrypted tokens.
const HKDF_INFO = 'brandos-linkedin-token-v1';
const HKDF_SALT = 'BrandOS-LTKDF-v1';

function getKeyBuffer(key = process.env.LINKEDIN_TOKEN_ENCRYPTION_KEY) {
  const value = String(key || '').trim();
  if (!value) {
    throw new Error('LINKEDIN_TOKEN_ENCRYPTION_KEY is required.');
  }

  // HKDF is the correct primitive for deriving a fixed-length symmetric key
  // from a secret string. Bare SHA-256 (the previous approach) has no salt or
  // context separation, making it weaker against offline dictionary attacks if
  // the key material has low entropy.
  return Buffer.from(
    crypto.hkdfSync('sha256', Buffer.from(value, 'utf8'), HKDF_SALT, HKDF_INFO, 32)
  );
}

export function encryptSecret(value, options = {}) {
  const secret = String(value || '');
  if (!secret) {
    throw new Error('A secret value is required.');
  }

  const key = getKeyBuffer(options.key);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

// Decrypt a linkedin_email value that may be either AES-256-GCM ciphertext
// (iv.tag.ciphertext) or a legacy plaintext value written before encryption
// was added. Falls back to the raw value so existing connections keep working
// until a back-fill migration runs.
export function safeDecryptEmail(value) {
  if (!value) return '';
  // Encrypted values consist of exactly three base64url segments.
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) return value;
  try {
    return decryptSecret(value);
  } catch {
    return value;
  }
}

export function decryptSecret(payload, options = {}) {
  const parts = String(payload || '').split('.');
  if (parts.length !== 3) {
    throw new Error('Encrypted LinkedIn secret payload is invalid.');
  }

  const [ivValue, tagValue, encryptedValue] = parts;
  const key = getKeyBuffer(options.key);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivValue, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
