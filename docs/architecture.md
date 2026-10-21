# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep React pages focused on rendering and user interaction; route all requests through the shared API client using relative `/api` paths.
- Logic tier decision: Keep HTTP handling in Express routes and put validation, persistence workflows, and computed results in backend services.
- Data tier decision: Use Mongoose schemas with required-field validation and an idempotent seed script that updates demo records without deleting unrelated data.
- Activity tracking approach: Validate IDs and referenced user/team records before creating an activity; return deliberate 4xx errors for invalid input, and compute points and occurrence time in the service.
- Team management approach: Require a team name, preserve submitted team details, and maintain member references when creating or listing teams.
- Leaderboard approach: Aggregate activity points by team, sort totals descending, and assign 1-based ranks in the service.
- Workout suggestions approach: Find the user by email and recommend workouts matching their fitness goal or recent activity, including a reason; return 4xx when no user matches.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` - checks required Mongoose fields and repeatable, non-destructive demo seeding; failures point to schema or seed behavior.
- API command: `npm run test:api --prefix octofit-tracker/backend` - checks request validation, activity/team creation, leaderboard totals and ordering, and personalized workout suggestions; failures point to route/service behavior or response contracts.
- Frontend command: `npm test --prefix octofit-tracker/frontend` - checks API-backed page content plus loading, empty, and error states; failures point to client usage, rendering, or accessibility state handling.
- Backend build command: `npm run build --prefix octofit-tracker/backend` - type-checks the backend; failures indicate TypeScript or backend contract mismatches.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` - type-checks and bundles the frontend; failures indicate TypeScript, module, or Vite build issues.
