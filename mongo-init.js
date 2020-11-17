db.createUser({
  user: 'devUser',
  pwd: 'Password123',
  roles: [
    {
      role: 'readWrite',
      db: 'dev',
    },
  ],
});
