# Christmas Gifter client

React + TypeScript app built with [Vite](https://vite.dev/).

```bash
npm install
npm start       # dev server on http://localhost:3000
npm test        # run tests with Vitest
npm run lint    # lint with oxlint
npm run build   # type-check and build to dist/
npm run preview # serve the production build locally
```

Requests to `/api` are proxied to the server. The target defaults to `http://localhost:4000` and can be changed with the `PROXY_HOST` and `PROXY_PORT` environment variables (see `vite.config.ts`).
