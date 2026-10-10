# christmas-gifter-ts

A Secret Santa style gift assignment app.

- `server/`: Express + Mongoose API written in TypeScript (port 4000)
- `client/`: React + TypeScript app built with Vite (port 3000)

## Requirements

- Node 24 (run `nvm use` in the repo root to pick up the version from `.nvmrc`)
- Docker, if you want to run everything with Docker Compose

## Run with Docker Compose

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:4000
- Mongo Express: http://localhost:8081 (login `admin` / `pass`)

Database data is kept in the `mongo-data` Docker volume. Run `docker compose down -v` to wipe it and start fresh.

## Run locally

Start MongoDB yourself (or run `docker compose up mongo`), then in two terminals:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm start
```

The client dev server forwards `/api` requests to the server on port 4000.

## API requests (Bruno)

The `bruno/` folder is a [Bruno](https://www.usebruno.com/) collection (Bruno 3 or newer) with requests for every API endpoint.

1. In Bruno, open the collection from the `bruno/` folder.
2. Select the `local` environment, which points at `http://localhost:4000`.
3. Run the `groups` folder with the collection runner, or send the requests one at a time starting with "Create group". Each request saves the ids that the following requests need.

## Useful scripts

| Folder   | Command         | What it does                            |
| -------- | --------------- | --------------------------------------- |
| `server` | `npm run dev`   | Start the API and restart on changes    |
| `server` | `npm run build` | Compile TypeScript to `dist/`           |
| `server` | `npm start`     | Run the compiled API                    |
| `client` | `npm start`     | Start the Vite dev server               |
| `client` | `npm test`      | Run tests with Vitest                   |
| `client` | `npm run lint`  | Lint with oxlint                        |
| `client` | `npm run build` | Type-check and build to `client/dist/`  |
