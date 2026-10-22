import { serializeSignedCookie } from 'better-call';
import { Request, Response } from 'express';

import { Auth } from '#src/infrastructure/auth/better-auth';

const devSessionController = (auth: Auth) => {
  const create = async (req: Request, res: Response) => {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!email || !name) {
      res.status(400).send({
        failure: {
          type: 'DEV_SESSION_INVALID',
          reason: 'Email and name are required',
        },
      });
      return;
    }

    const ctx = await auth.$context;
    const existing = await ctx.internalAdapter.findUserByEmail(email);
    const user =
      existing?.user ??
      (await ctx.internalAdapter.createUser(
        { email, name, emailVerified: true },
        { method: 'admin' }
      ));
    const session = await ctx.internalAdapter.createSession(user.id);
    const cookie = await serializeSignedCookie(
      ctx.authCookies.sessionToken.name,
      session.token,
      ctx.secret,
      {
        ...ctx.authCookies.sessionToken.attributes,
        maxAge: ctx.sessionConfig.expiresIn,
      }
    );
    res.append('Set-Cookie', cookie);
    res.send({ user: { id: user.id, email: user.email, name: user.name } });
  };

  return { create };
};

export default devSessionController;
