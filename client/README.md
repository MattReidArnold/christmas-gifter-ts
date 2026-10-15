# Christmas Gifter client

React + TypeScript app built with [Vite](https://vite.dev/), [Material UI](https://mui.com/), [React Router](https://reactrouter.com/) and [TanStack Query](https://tanstack.com/query).

```bash
npm install
npm start       # dev server on http://localhost:3000
npm test        # run tests with Vitest
npm run lint    # lint with oxlint (includes jsx-a11y accessibility rules)
npm run build   # type-check and build to dist/
npm run preview # serve the production build locally
```

Requests to `/api` are proxied to the server. The target defaults to `http://localhost:4000` and can be changed with the `PROXY_HOST` and `PROXY_PORT` environment variables (see `vite.config.ts`).

## Routes

Every screen and dialog has its own URL, so refreshing the page, using the back button, or sharing a link reopens the same view.

| Path                                         | Shows                                       |
| -------------------------------------------- | ------------------------------------------- |
| `/`                                          | Redirects to `/groups`                      |
| `/groups`                                    | Group list                                  |
| `/groups/new`                                | Group list with the "New group" dialog      |
| `/groups/:groupId`                           | Group detail and its participants           |
| `/groups/:groupId/edit`                      | Group detail with the "Rename group" dialog |
| `/groups/:groupId/participants/new`          | Group detail with "Add participant" dialog  |
| `/groups/:groupId/participants/:id/edit`     | Group detail with "Edit participant" dialog |
| `/projects`                                  | Project cards with status/advisor/sort filters |

The route tree lives in `src/router.tsx` and URLs are built with the helpers in `src/paths.ts`. Each route's loader fills the TanStack Query cache before the page renders, and pages read it with `useSuspenseQuery`. Loaders reuse cached data that is less than 30 seconds old and has not been marked out of date; otherwise they wait for the server. Unknown groups and participants show a "not found" page.

Every signed-in page sits under the pathless `AppLayout` route (`src/layouts/AppLayout.tsx`). When login is added, put the auth check on that route and add `/login` as its sibling. All API calls go through `apiFetch` in `src/api/http.ts`, which is the place to attach credentials and handle `401` responses.

## Test selectors

Tests find elements the way a user does: by role and accessible name, by form label, or by visible text. React Testing Library, Playwright (`getByRole`, `getByLabel`) and Cypress Testing Library all support these queries, so the same selectors work for component tests and end-to-end UI tests. Use them in this order:

1. Role and accessible name: `getByRole('button', { name: 'New group' })`
2. Form label: `getByLabelText('Name')` / Playwright `getByLabel('Name')`
3. Visible text, for non-interactive content: `getByText('No groups yet')`
4. `data-testid`, only when an element has no meaningful role or name

The UI keeps these selectors stable:

- **Page structure.** The app bar is the `banner` landmark, page content is in `main`, and breadcrumbs are a `navigation` landmark named "Breadcrumb". Each page has one level-1 heading ("Groups", or the group's name). The participants section has a level-2 "Participants" heading.
- **Lists.** Groups and participants are lists named "Groups" and "Participants". To work with one row, find the `listitem` that contains the name, e.g. `within(list).getAllByRole('listitem')` or Playwright `getByRole('listitem').filter({ hasText: 'Alice' })`.
- **Links and buttons.** Anything that changes the URL is a `link`: "New group", "Rename group", "Add participant", "Edit Alice", the group rows and "Back to groups". Actions on the current page are `button`s: "Delete group", "Delete Alice", and the dialog buttons. Icon-only controls are named after their participant ("Edit Alice", "Delete Alice") so each row's controls are unique.
- **Dialogs.** Every dialog is named by its title: "New group", "Rename group", "Add participant", "Edit participant", "Delete Family?", "Delete Alice?". Target them with `getByRole('dialog', { name })` and query inside them. While a dialog is open the rest of the page is hidden from the accessibility tree, so wait for it to close before querying the page again.
- **Forms.** Fields have visible labels ("Name", and the "Exclusions" combobox). Pressing Enter submits. Submit buttons are "Create", "Save" or "Add".
- **Feedback.** Server failures appear in an `alert` inside the dialog, using the server's failure reason. Empty states are plain text ("No groups yet", "No participants yet", "No exclusions"). Spinners are labelled ("Loading", "Loading page").
- **`data-testid`.** Use kebab-case names scoped by feature, such as `group-participant-count`. Never build them from display text.

`src/router.test.tsx` shows these queries in use. It renders the full route tree with `renderApp` (`src/test/renderApp.tsx`), which starts at any URL and uses an in-memory fake of the API (`src/test/fakeApi.ts`).
