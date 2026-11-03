---
name: my-review
description: Review the current git diff with five parallel reviewers (/code-review, /ponytail-review, and the pr-review-toolkit agents silent-failure-hunter, pr-test-analyzer, comment-analyzer), let them discuss each other's findings, verify and merge into one file, then grill the user item by item (fix? yes/no) and fix only approved items. Use on /my-review, or whenever the user asks to review their changes before a PR.
argument-hint: "[base-branch] [task description or path to it]"
disable-model-invocation: true
---

# my-review

Review only. Never commit, never push. Real testing is `/local-test`, PR is `/gh-push`.
Requires the `pr-review-toolkit` plugin (`/plugin install pr-review-toolkit@claude-plugins-official`). Missing → stop and say so.

## 1. Scope
- Base = `$0` if given, else `main`, else `master`. Diff = `git diff <base>...HEAD` + `git diff HEAD`. Empty → stop.
- Intent = `$ARGUMENTS` text/file if given, else commit messages since base. Write 2–3 lines: what this change is supposed to do. Ask the user: right? Fix until yes.
- Triage hunks: renames, formatting-only, lockfiles, generated/vendored files, snapshot updates are mechanical → reviewers do not get them. List them in the `MY-REVIEW.md` header as `Excluded:`.

## 2. Five reviewers, one message, parallel
Every prompt gets: base, intent, changed file list, and this rule block:

```
Report only. Do not edit, create, or format any file.
Return findings as text in this template, severity chosen by you:
### [BLOCKER|CONCERN|SUGGESTION|QUESTION] title
File: path:line
What: 1–2 sentences   Why: what breaks or costs   Fix: smallest change
Trigger: the concrete input or state that causes it → expected vs actual
A BLOCKER or CONCERN with no nameable Trigger is a QUESTION, not a bug.
Do not report: style, anything a linter/compiler already catches, unchanged lines,
code under a suppression comment (eslint-disable, noqa), speculative future risk.
No findings → "No findings."
```

| # | Subagent | Task |
|---|----------|------|
| A | general-purpose | Run the `code-review` skill at `medium` on the diff vs base |
| B | general-purpose | Run the `ponytail-review` skill on the diff vs base |
| C | `pr-review-toolkit:silent-failure-hunter`, model `sonnet` | Error handling, swallowed failures, bad fallbacks in the diff |
| D | `pr-review-toolkit:pr-test-analyzer`, model `sonnet` | Behaviour in the diff with no test, missing edge cases |
| E | `pr-review-toolkit:comment-analyzer`, model `sonnet` | Comments that lie, rot, or restate obvious code |

Any reviewer fails or is unavailable → stop, tell the user which one and why.
After all return: `git status --short` must match step 1. If a reviewer edited files → stop, show the diff.

## 3. Discussion round
Send each reviewer (SendMessage) the other four's findings. Ask for one line per foreign item:
`agree` / `dispute: <reason>` / `duplicate of <own item>`. Collect all five replies.

## 4. Verify and merge → `MY-REVIEW.md` (project root, overwritten)
- Open every `file:line`. Problem not in the code → drop.
- Duplicates (same file, same problem) → one item, highest severity, `Flagged by: A, C`.
- Disputed → keep, add `Disputed by B: <reason>`.
- Order BLOCKER → CONCERN → SUGGESTION → QUESTION, number 1..N. Header: intent + counts per severity + worst item + `Excluded:` list.
- Rewrite every item in B1-level English before saving. Reviewers write for machines; the file is for the user.

## 5. Grill
- Show the header first. Then one item at a time: number, severity, title, `file:line`, What/Why/Fix, dispute if any. Ask: **Fix? (yes / no)**
- Wait. Plain-line answers; several lines = answers to the next items in order.
- User disagrees → argue from the code once, then accept. Write `Decision: yes|no` under the item.

## 6. Fix
- Fix every `yes`. Smallest change that resolves it. Keep validation and error handling.
- Show `git diff --stat` + fixed item numbers. Stop. Next: `/local-test`, then `/gh-push`.
