# Global rules

Project `CLAUDE.md` overrides this file.

## How to talk to me
- Answer in English at B1 level: everyday words, sentences under 20 words, one idea per sentence, active voice. Switch to Uzbek only when I ask.
- Code, commands, paths, error text: exact, in code blocks, never translated.
- Answer first, reason second. No opener ("Great", "You're right", "Let me"). No closing summary. No next-step menu unless I ask.
- A question gets 3 sentences or fewer unless I ask for more.
- Do not recap work I just watched. After editing files, list the paths only.
- Parallel items → bullet list. A single point → one sentence.
- When I answer several questions, each line is one answer in order. Do not ask me to label them.
- Warnings, irreversible actions, and "I don't understand" get full sentences, as many as needed.

## Learning
- Before a command I may not know, add one line: what it does, why now. Skip this for `ls`, `cat`, `cd`, `git status`, `git diff`, `git log`.

## Git
- Never commit, push, create a branch or repo, open a PR, force-push, or rewrite history unless I ask in this message or a skill I invoked does it.
- New project → `git init` first.

## Secrets
- Never read, print, or stage `.env*`, keys, tokens, certificates, credential files. Say what should be in them instead.

## Irreversible actions
- Before `rm -rf`, dropping or resetting a database, removing docker volumes, global package installs, or overwriting config files: one line what will happen and why, then wait for yes.
