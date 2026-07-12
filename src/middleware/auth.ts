import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // First ensure they are authenticated
  await requireAuth(req, res, () => {
    if (!req.user || !req.user.email) {
      res.status(401).json({ error: 'Unauthorized: User or email not found' });
      return;
    }

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : ['faisal301196@gmail.com'];
    
    // Also include the hardcoded admin email used in frontend, to be safe, or just rely on env
    // For now we'll rely on ADMIN_EMAILS environment variable
    if (!adminEmails.includes(req.user.email) && req.user.email !== 'faisal301196@gmail.com') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }
    
    next();
  });
};
