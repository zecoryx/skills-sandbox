---
name: local-test
description: End-to-end test the current git diff against the running app for real: start the stack, seed the data the task needs, hit every changed endpoint with curl, walk every changed UI flow in a browser (chrome-devtools-axi), call changed integrations, and check the DB rows after each step. Reports PASS/FAIL in the terminal, grills the user on each FAIL (fix? yes/no), fixes only approved ones. Use on /local-test, or whenever the user wants to verify their change actually works, not just reads well.
argument-hint: "[base-branch] [task description or path to it] [all]"
disable-model-invocation: true
---

# local-test

Testing only. Never commit, never push. Never read `.env*`. Code review is `/my-review`, PR is `/pr-review`.

## 1. Scope
- Base = `$0` if given, else `main`, else `master`. Diff = `git diff <base>...HEAD` + `git diff HEAD`. Empty → stop.
- Intent = `$ARGUMENTS` text/file if given, else commit messages since base. Write 2–3 lines: what this change is supposed to do. Ask the user: right? Fix until yes.
- From the diff list: changed endpoints, changed UI pages/components (+ pages that use them, via grep), changed integrations, changed DB schema.

## 2. Commands
- Read `## local-test` in the project `CLAUDE.md`: `start`, `seed`, `reset`, `db` (query command, e.g. `docker compose exec db psql -U "$POSTGRES_USER" "$POSTGRES_DB" -c`), `url`.
- Missing → infer from `docker-compose.yml`, `package.json`, `Makefile`, `README`. Show the commands, ask: right? After yes, offer to write them into `CLAUDE.md` under `## local-test`.

## 3. Start and seed
- `docker compose ps` (or equivalent). Running → reuse. Else `start`, wait until `url` answers.
- Seed = project seed script if one exists, else write the rows the intent needs (SQL or API POSTs) to `/tmp/local-test/seed.*`. Show it, run after yes.

## 4. Cases
Derive only from changed places. Print each case before running it. Checklist:
- **Endpoint**: happy → empty/invalid body → unauthorized → not found → duplicate → boundary values. After each: `db` query for the row that should (not) exist or change.
- **UI flow** (chrome-devtools-axi): open page → complete the flow → empty form → wrong input → double submit → refresh mid-flow. Check: flow finished, no console errors, no 4xx/5xx in network, expected DB row.
- **Integration**: list every call that leaves the machine. Ask per call: **Run it? (yes / no)**. No → SKIP. Yes → real request, then check what arrived on both sides.
- Argument `all` → walk every page of the app, not only changed ones.

## 5. Results
Print a table: `# | case | command/flow | expected | actual | DB | PASS/FAIL/SKIP`. FAIL → screenshot (UI) or response body saved to `/tmp/local-test/`, path shown.
Then one FAIL at a time: show it, ask **Fix? (yes / no)**. Wait. Plain-line answers; several lines = next items in order.

## 6. Fix and re-run
- Fix every `yes`. Smallest change. Keep validation and error handling. Re-run only the fixed cases, update the table.
- `reset` exists → run it. Else list what was seeded and leave the DB.
- Show `git diff --stat`. Stop. Next: `/my-review`, then `/pr-review`.
