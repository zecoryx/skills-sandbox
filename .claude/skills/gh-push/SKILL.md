---
name: gh-push
description: Ship the current changes: propose one plan (Linear task, branch, commits, PR as ready/draft/stacked) from the conversation and the git diff, wait for the user to say "boshla" or ask for edits, then execute every step without further questions. Use on /gh-push, or when the user asks to commit, push, open a PR, or create the Linear task for finished work.
argument-hint: "[SCR-12 | new | none] [extra context]"
disable-model-invocation: true
---

# gh-push

Nothing runs before the user says **boshla**. After boshla, no more questions; stop only on error. Never force-push, never amend pushed commits, never stage `.env*`, keys, dumps, build output. Never pass `--no-verify` / `-n` to commit or push and never edit a git hook: a failing hook → stop, show its output, fix the code.

## 1. Gather
- `git status --short`, `git branch --show-current`, `git diff HEAD --stat`, `git log --oneline <base>..HEAD`. Nothing to ship → stop.
- Intent = this conversation + the diff + `$ARGUMENTS`. One paragraph: what changed and why.
- Defaults from project `CLAUDE.md` `## gh-push`: `team` (SCR/HYS/OPS), `base`, `pr` (ready|draft). Missing → ask in the plan, offer to write them to `CLAUDE.md` at the end.
- Open PR on the current branch? `gh pr view --json number,baseRefName` → stacked candidate.

## 2. Plan (print, then wait)

```
LINEAR   new | SCR-12 | none
  title:        <human title>
  description:  What / Why / Acceptance (3–5 lines)
  team: SCR   assignee: me   priority: none   labels: none
  status: In Progress → In Review after PR
  (stacked → sub-issue of the parent task)

BRANCH   <Linear suggested name>  | current: <name> (reuse)
  from: main | <current branch> (stacked)

COMMITS  (conventional, grouped by concern; 1 if small)
  1. feat(scope): title
     files: a.ts, b.ts
  2. test(scope): title
     files: a.test.ts

PR       ready | draft | stacked on #N
  base:  main | <current branch>
  title: <commit 1 title or summary>
  body:  What / Why / How tested / Fixes SCR-12  (stacked or partial → Part of SCR-12)

Excluded: <sensitive or unrelated files, if any>
```

Ask: **boshla, yoki nimani o'zgartiray?** Edits → update the plan, print again, ask again.

## 3. Execute (after boshla, in this order)
1. Linear: `new` → create issue (title, description, team, assignee me, status In Progress; `parentId` when stacked). Existing → set In Progress. Take its suggested branch name.
2. Branch: `git switch -c <name>` from the planned base, or stay.
3. Commits: for each group `git add <files>` then `git commit -m`. Verify `git status` is clean afterwards.
4. Push: `git push -u origin <branch>`. Rejected → stop, show, no force.
5. PR: `gh pr create --base <base> --title "<ID>: ..." --body ...` (`--draft` when draft). Body ends with `Fixes <ID>` (closing PR) or `Part of <ID>` (stacked/partial). These are Linear magic words; a plain `Linear: <ID>` does not link.
6. Linear: status In Review, comment with PR URL.
7. `CLAUDE.md` defaults missing → append `## gh-push` with team/base/pr.

## 4. Done
Print: branch, commit hashes, PR URL, Linear URL. Stop.
