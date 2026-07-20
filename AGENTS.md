<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. If that directory looks missing/empty, run `npm install` first before concluding this instruction is stale — a prior session mistook it for a fabricated instruction simply because it hadn't installed dependencies.
<!-- END:nextjs-agent-rules -->

# Before starting work: check branch freshness

Each hourly review session gets the same fixed branch name and starts from whatever that branch's `HEAD` already is — which is often stale, not `main`. Run this before diagnosing anything:

```
git fetch origin main
git log --oneline HEAD..origin/main | head -20   # commits you're missing
```

If `main` has moved, **rebase or restart your branch from `origin/main`** before investigating (`git checkout -B <branch> origin/main` is usually simplest since these branches carry one session's work at a time). Skipping this has repeatedly caused duplicate PRs re-diagnosing bugs already fixed upstream — see `ROADMAP.md` (Seller Note fixed independently 3×, one FCF reconciliation bug diagnosed twice with different numbers, and a 2026-07-20 session that built a full fix before noticing its branch was 17 commits behind `main`). Also check open PRs (`gh pr list` / the GitHub MCP tools) for existing unmerged work on the same issue before starting a fix.
