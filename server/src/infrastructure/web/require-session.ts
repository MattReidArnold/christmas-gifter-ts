import { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { Auth } from '#src/infrastructure/auth/better-auth';

const unauthenticated = {
  failure: {
    type: 'UNAUTHENTICATED',
    reason: 'Sign in to continue',
  },
};

export const requireSession =
  (auth: Auth): RequestHandler =>
  async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      res.status(401).send(unauthenticated);
      return;
    }
    req.user = { id: session.user.id };
    next();
  };

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}
