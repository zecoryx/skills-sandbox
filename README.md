# skills-sandbox

Small users API for trying out Claude Code skills. Node + Express + Postgres.

## Run

```
docker compose up --build
npm run seed        # inside the api container or with DATABASE_URL set
```

API on http://localhost:3000, form page on http://localhost:3000/.

## Endpoints

- `GET /health` → `{ ok, version }`
- `POST /users` `{ name, email, balance }` → 201, 400 on bad input, 409 on duplicate email
- `GET /users/:id` → 200, 400 bad id, 404 missing
- `DELETE /users/:id` with header `x-api-key` → 204, 401 without key, 404 missing

## Scripts

```
npm test          # unit tests
npm run typecheck
npm run seed      # two demo users
```
