# Ralph Loop Operating Note

## Purpose

Use a Ralph-loop inspired self-review cadence inside normal Codex execution. The actual hook may not be active in this environment, so this file records the same discipline explicitly.

## Prompt

Build Lab Link according to `LABLINK_PRD.md` using layered GSD execution. After every layer, verify what exists, remove temporary intermediate features that should not survive, improve the weakest area, update planning docs, commit, and only mark completion when the completion promise is genuinely true.

## Completion Promise

`LABLINK_LAYERED_FOUNDATION_VERIFIED`

## Max Iterations For This Session

8 focused iterations.

## Iteration Log

| Iteration | Layer | Verification | Result | Follow-up |
| --- | --- | --- | --- | --- |
| 1 | Planning/repo setup | Files exist, git repo initialized | Complete | Commit planning docs |
| 2 | Foundation scaffold | `git diff --check`; non-ASCII scan; npm install attempt | Verify with blocker | Commit code, resolve npm install, run real validation |
