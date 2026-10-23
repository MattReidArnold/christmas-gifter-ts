# gift-exchange-ts

A surprise gift exchange app for drawing names.

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

## Google sign-in

People sign in with Google. There is no username or password. The browser loads the app and calls `/api` on one origin. Google sends the user back to `{origin}/api/auth/callback/google`, and the session cookie is stored for that same origin.

`server/.env` is gitignored. Copy `server/.env.example` to `server/.env`. The server refuses to start when `BETTER_AUTH_SECRET` is missing. Google sign-in stays off until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are both set. Set both, or leave both empty.

### Create the OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create a project.
2. Go to **Google Auth Platform** (under APIs & Services).
3. **Branding:** set the app name, a user support email, and a developer contact email.
4. **Audience:** choose **External** so any Google account can be added, or **Internal** to limit sign-in to your Workspace organization. While the app is in **Testing**, open **Test users** and add each Google account that should be able to sign in. Publish the app when any Google account should be able to sign in. This app asks only for `openid`, `email`, and `profile`, which are non-sensitive scopes.
5. **Clients → Create client.** Choose **Web application**.
6. Add the origins and redirect URIs below. Google matches them exactly, including scheme and port, and the redirect URI has no trailing slash. One client can list the localhost values and the Cloud Run values together.

### Localhost

Open the app at `http://localhost:3000`. The Vite dev server proxies `/api` to the API on port 4000, so Google talks to port 3000.

On the OAuth client:

| Field | Value |
| ----- | ----- |
| Authorized JavaScript origin | `http://localhost:3000` |
| Authorized redirect URI | `http://localhost:3000/api/auth/callback/google` |

In `server/.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
BETTER_AUTH_SECRET=your-generated-secret
BETTER_AUTH_URL=http://localhost:3000
```

Generate the secret with `openssl rand -base64 32`. `BETTER_AUTH_URL` stays `http://localhost:3000` when the API runs in Docker. That value is the address in the browser, which is also where the session cookie is set.

Docker Compose reads `server/.env` when it creates the server container. `npm run dev` reads it through Node's `--env-file`. After changing the file, recreate the container or restart the dev process:

```bash
docker compose up -d --force-recreate server
```

Then open http://localhost:3000 and choose **Sign in with Google**.

### Cloud Run

Use one public HTTPS hostname for the site and for `/api`. `BETTER_AUTH_URL` is that hostname. Two default Cloud Run URLs (`*.run.app`) cannot share a session cookie, because `run.app` is a public suffix. Serve both from one Cloud Run service, or put a load balancer in front of separate services so that `/api` goes to the API and the rest of the site goes to the client, both on that hostname.

On the OAuth client, add the production host next to the localhost entries:

| Field | Value |
| ----- | ----- |
| Authorized JavaScript origin | `https://<public-host>` |
| Authorized redirect URI | `https://<public-host>/api/auth/callback/google` |

`<public-host>` is the hostname people type, such as `gifts.example.com` or a single `*.run.app` service URL. When you later attach a custom domain, add that origin and redirect URI and change `BETTER_AUTH_URL` to match, then deploy a new revision.

Set these on the API service. Store `GOOGLE_CLIENT_SECRET` and `BETTER_AUTH_SECRET` in Secret Manager and attach them as environment variables. Generate a new `BETTER_AUTH_SECRET` for Cloud Run (`openssl rand -base64 32`). The client id can be a plain variable.

| Variable | Value |
| -------- | ----- |
| `GOOGLE_CLIENT_ID` | Client id from the OAuth client |
| `GOOGLE_CLIENT_SECRET` | Client secret from the OAuth client |
| `BETTER_AUTH_SECRET` | New production secret |
| `BETTER_AUTH_URL` | `https://<public-host>` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Production database reachable from Cloud Run |

`NODE_ENV=production` leaves `POST /api/dev/session` unmounted. Better Auth stores users in `MONGODB_URI`. Deploy a new revision after the variables are set, then sign in from `https://<public-host>`.

### After sign-in

The first Google sign-in creates the user. A new group records that user as its only member, with role `owner`. Every signed-in user can still see and change every group.

Outside production, `POST /api/dev/session` with `{ email, name }` creates that user if needed and sets the same session cookie a Google sign-in would. Integration tests and the Bruno collection use it.

Groups saved before members existed load with an empty `members` list. Wipe the dev database with `docker compose down -v` when you want to drop those groups.

## API endpoints

| Method   | Path                                               | What it does                                    |
| -------- | -------------------------------------------------- | ----------------------------------------------- |
| `GET`    | `/health`                                          | Health check, no session                        |
| `POST`   | `/api/dev/session`                                 | Dev-only session cookie (`{ email, name }`)    |
| `GET`    | `/api/groups`                                      | List groups                                     |
| `POST`   | `/api/groups`                                      | Create a group (`{ name }`)                     |
| `GET`    | `/api/groups/:groupId`                             | Get a group                                     |
| `PUT`    | `/api/groups/:groupId`                             | Rename a group (`{ name }`)                     |
| `DELETE` | `/api/groups/:groupId`                             | Delete a group                                  |
| `POST`   | `/api/groups/:groupId/participants`                | Add a participant (`{ name, exclusions }`)      |
| `PUT`    | `/api/groups/:groupId/participants/:participantId` | Update a participant (`{ name?, exclusions? }`) |
| `DELETE` | `/api/groups/:groupId/participants/:participantId` | Remove a participant                            |

`/api/auth/*` is the Google sign-in flow. Group routes require the session cookie. A missing cookie responds with `401` and `{ failure: { type: "UNAUTHENTICATED", reason } }`. Creating a group sets `members` from the signed-in user and ignores a `members` field on the request. Group and participant changes respond with the updated group, including `members`. Other failures respond with `{ failure: { type, reason } }`.

## Testing

The server has two Vitest suites. Run them from `server/`:

- `npm test` runs the unit tests for the domain and application layers. They need no database or running server. Use `npm run test:watch` while developing.
- `npm run test:integration` sends HTTP requests to a running API, so start MongoDB and the server first (`npm run dev` or `docker compose up`). The tests target `http://localhost:4000` by default; set `API_BASE_URL` to point them elsewhere. They use the dev database and delete every group they create.
- `npm run typecheck` type-checks the source and the tests.

The client tests (`npm test` in `client/`) render the whole route tree against an in-memory fake of the API, so they need no server. See [client/README.md](client/README.md) for the selector conventions UI tests should follow.

## Error handling

The server follows these conventions. See [server/src/domain/shared/README.md](server/src/domain/shared/README.md) for usage, examples, and how to add a new failure.

- Expected failures, such as validation errors or a missing group, are returned as a `Result` (`server/src/domain/shared/result.ts`) holding a typed `Failure`; they are never thrown. Check `result.ok` before reading `result.value`, and return `result` as-is to pass a failure up.
- Repositories return `null` (or `false` from `delete`) when a record doesn't exist; the use case turns that into a `Failure`.
- Only unexpected problems, such as a database outage or a bug, throw.
- Use cases with no expected failures, such as `listGroups`, return plain values.
- Every failure type must have an HTTP status in `statusForFailure` in the group controller; the compiler reports any that are missing.

## API requests (Bruno)

The `bruno/` folder is a [Bruno](https://www.usebruno.com/) collection (Bruno 3 or newer) with requests for every API endpoint.

1. In Bruno, open the collection from the `bruno/` folder.
2. Select the `local` environment, which points at `http://localhost:4000`.
3. Run the collection from the top, or send "Dev session" and then the `groups` folder. "Dev session" saves the session cookie the group requests send. Each group request saves the ids that the following requests need. The collection does not go through Google.

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
