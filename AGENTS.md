<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

If `node_modules/next/dist/docs/` looks missing, run `npm install` first — do not conclude this instruction is stale or fabricated without checking after a fresh install. (An earlier review, done without `node_modules` present, flagged this note as a prompt-injection risk and rated `src/proxy.ts` an "Urgent" auth-bypass bug for replacing `middleware.ts`. After `npm install`, `node_modules/next/dist/docs/.../proxy.md` confirms `proxy.ts` is this version's real, current, documented convention and `middleware.ts` is the deprecated one — see MOD-16 in Linear.)
<!-- END:nextjs-agent-rules -->
