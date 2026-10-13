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

## API endpoints

| Method   | Path                                               | What it does                                    |
| -------- | -------------------------------------------------- | ----------------------------------------------- |
| `GET`    | `/api/groups`                                      | List groups                                     |
| `POST`   | `/api/groups`                                      | Create a group (`{ name }`)                     |
| `GET`    | `/api/groups/:groupId`                             | Get a group                                     |
| `PUT`    | `/api/groups/:groupId`                             | Rename a group (`{ name }`)                     |
| `DELETE` | `/api/groups/:groupId`                             | Delete a group                                  |
| `POST`   | `/api/groups/:groupId/participants`                | Add a participant (`{ name, exclusions }`)      |
| `PUT`    | `/api/groups/:groupId/participants/:participantId` | Update a participant (`{ name?, exclusions? }`) |
| `DELETE` | `/api/groups/:groupId/participants/:participantId` | Remove a participant                            |

Group and participant changes respond with the updated group. Failures respond with `{ failure: { type, reason } }`.

## Testing

The server has two Vitest suites. Run them from `server/`:

- `npm test` runs the unit tests for the domain and application layers. They need no database or running server. Use `npm run test:watch` while developing.
- `npm run test:integration` sends HTTP requests to a running API, so start MongoDB and the server first (`npm run dev` or `docker compose up`). The tests target `http://localhost:4000` by default; set `API_BASE_URL` to point them elsewhere. They use the dev database and delete every group they create.
- `npm run typecheck` type-checks the source and the tests.

The client tests (`npm test` in `client/`) render the whole route tree against an in-memory fake of the API, so they need no server. See [client/README.md](client/README.md) for the selector conventions UI tests should follow.

## Error handling

The server follows these conventions:

- Expected failures, such as validation errors or a missing group, are returned as a `Result` (`server/src/domain/shared/result.ts`) holding a typed `Failure`; they are never thrown. Check `result.ok` before reading `result.value`, and return `result` as-is to pass a failure up.
- Repositories return `null` (or `false` from `delete`) when a record doesn't exist; the use case turns that into a `Failure`.
- Only unexpected problems, such as a database outage or a bug, throw.
- Use cases with no expected failures, such as `listGroups`, return plain values.
- Every failure type must have an HTTP status in `statusForFailure` in the group controller; the compiler reports any that are missing.

## API requests (Bruno)

The `bruno/` folder is a [Bruno](https://www.usebruno.com/) collection (Bruno 3 or newer) with requests for every API endpoint.

1. In Bruno, open the collection from the `bruno/` folder.
2. Select the `local` environment, which points at `http://localhost:4000`.
3. Run the `groups` folder with the collection runner, or send the requests one at a time starting with "Create group". Each request saves the ids that the following requests need.

## Useful scripts

| Folder   | Command                    | What it does                                  |
| -------- | -------------------------- | --------------------------------------------- |
| `server` | `npm run dev`              | Start the API and restart on changes          |
| `server` | `npm run build`            | Compile TypeScript to `dist/`                 |
| `server` | `npm start`                | Run the compiled API                          |
| `server` | `npm test`                 | Run unit tests with Vitest                    |
| `server` | `npm run test:integration` | Run integration tests against the running API |
| `client` | `npm start`                | Start the Vite dev server                     |
| `client` | `npm test`                 | Run tests with Vitest                         |
| `client` | `npm run lint`             | Lint with oxlint                              |
| `client` | `npm run build`            | Type-check and build to `client/dist/`        |
