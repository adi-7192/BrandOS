import crypto from 'crypto';

function getKeyBuffer(key = process.env.LINKEDIN_TOKEN_ENCRYPTION_KEY) {
  const value = String(key || '').trim();
  if (!value) {
    throw new Error('LinkedIn token encryption key is required.');
  }

  return crypto.createHash('sha256').update(value).digest();
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
