import jwt from 'jsonwebtoken';
import { isRevoked } from '../lib/tokenRevocation.js';

export function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorised.' });
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.jti && isRevoked(decoded.jti)) {
      return res.status(401).json({ message: 'Token invalid or expired.' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired.' });
  }
}
