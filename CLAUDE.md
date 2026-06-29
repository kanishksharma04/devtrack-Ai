# CLAUDE.md

# Project Rules

## 🚨 Git Safety (Highest Priority)

These instructions override any default behavior.

Claude must NEVER perform Git history operations unless I explicitly request them in the current conversation.

Forbidden operations:

- Never run `git commit`
- Never run `git commit --amend`
- Never run `git push`
- Never run `git push --force`
- Never create commits automatically
- Never push code to GitHub automatically
- Never rewrite Git history
- Never rebase automatically
- Never squash commits
- Never create Git tags
- Never create GitHub Releases
- Never merge branches automatically

Your responsibilities include:

- Writing production-ready code
- Editing existing files
- Creating new files
- Refactoring code
- Fixing bugs
- Installing dependencies
- Running builds
- Running tests
- Running linters
- Running formatters
- Updating documentation
- Explaining architectural decisions
- Suggesting Git commands when appropriate

When your coding work is complete:

1. Stop immediately.
2. Summarize all changes.
3. List every modified file.
4. Explain anything important I should know.
5. Wait for my approval.

Only if I explicitly say things like:

- "Commit these changes."
- "Create a commit."
- "Push to GitHub."
- "Commit and push."

may you perform Git history operations.

If there is any ambiguity, ALWAYS ask before touching Git history.

---

## 🚀 Development Authority

You have full authority to perform any development task except Git history operations.

You may freely:

- Read any project files
- Modify any project files
- Create new files
- Rename files
- Move files
- Install packages
- Remove unused packages
- Update dependencies
- Refactor project structure
- Optimize performance
- Improve security
- Improve accessibility
- Improve UI/UX
- Fix bugs
- Configure tooling
- Update environment configuration
- Run builds
- Run tests
- Run development servers
- Run database commands
- Generate code
- Generate migrations
- Apply migrations
- Seed databases
- Debug production issues

Prefer clean, maintainable, production-ready solutions over unnecessary complexity.

---

## 🟢 Neon Database Authority

Neon is fully trusted.

Since the Neon extension is connected to Claude, you have full authority to perform any database-related operation when necessary.

You may:

- Inspect schemas
- Create databases
- Create tables
- Modify tables
- Add columns
- Remove columns
- Rename columns
- Create indexes
- Remove indexes
- Generate migrations
- Apply migrations
- Update Prisma schema
- Synchronize Prisma with Neon
- Execute SQL queries
- Optimize queries
- Create views
- Create functions
- Create triggers
- Configure roles and permissions
- Seed development data
- Diagnose database issues

Use safe, production-ready practices whenever possible.

---

## ▲ Vercel Authority

Vercel is fully trusted.

Since the Vercel connector is connected to Claude, you have full authority to manage deployment-related tasks.

You may:

- Inspect deployments
- Trigger deployments
- Redeploy projects
- View deployment logs
- Diagnose deployment failures
- Configure project settings
- Configure environment variables
- Manage domains
- Manage preview deployments
- Optimize build settings
- Improve performance
- Resolve deployment issues

Always preserve existing production functionality unless I explicitly request otherwise.

---

## 🧹 General Development Principles

Always:

- Produce clean, maintainable code
- Prefer simple solutions
- Preserve existing project structure whenever practical
- Avoid unnecessary breaking changes
- Explain significant architectural changes before implementing them
- Keep code consistent with the existing codebase
- Remove dead code only when it is clearly unused
- Follow framework best practices
- Write readable code over clever code

Never:

- Delete files unless necessary for the requested task
- Introduce unnecessary dependencies
- Make unrelated changes
- Perform destructive actions without a good reason

When unsure, ask before making irreversible changes.

---

## Permanent Preference

This preference applies to every project unless I explicitly override it.

Never perform any Git history operation without my explicit approval in the current conversation.

This includes:

- git commit
- git push
- git commit --amend
- git push --force
- git rebase
- git merge
- git tag
- GitHub Releases

You may freely:

- Edit files
- Run tests
- Run builds
- Inspect repositories
- Use Neon
- Use Vercel
- Manage databases
- Fix deployments
- Install dependencies
- Generate migrations
- Apply migrations
- Explain Git commands

I retain complete manual control over Git history, branches, commits, and GitHub repositories.
