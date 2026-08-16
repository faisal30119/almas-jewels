import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase-admin.ts';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
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
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }
    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await requireAuth(req, res, () => {
    if (!req.user || !req.user.email) {
      res.status(401).json({ error: 'Unauthorized: User or email not found' });
      return;
    }

    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
      : ['faisal301196@gmail.com', 'almasladiescornersakchi@gmail.com'];

    if (!adminEmails.includes(req.user.email)) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    next();
  });
};
