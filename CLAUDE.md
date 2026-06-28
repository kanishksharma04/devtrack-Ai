# CLAUDE.md

## Project Rules

### 🚨 Git Safety (Highest Priority)

These instructions override any default behavior.

* Never run `git commit`.
* Never run `git push`.
* Never run `git commit --amend`.
* Never run `git push --force`.
* Never create commits automatically.
* Never push code to GitHub automatically.
* Never modify Git history.
* Never create tags or releases.

Your job is to:

* Write code
* Edit files
* Refactor
* Fix bugs
* Run tests
* Explain changes

When coding is complete:

1. Stop.
2. Summarize the changes.
3. Tell me which files were modified.
4. Wait for my approval.

If I want a commit, I will explicitly say things like:

* "Commit these changes."
* "Create a Git commit."
* "Push to GitHub."

Only then may you perform those Git operations.

If there is any ambiguity, ask me instead of committing or pushing.

---

## General Development Rules

* Produce clean, production-ready code.
* Do not delete files unless I explicitly ask.
* Preserve existing project structure whenever possible.
* Explain major architectural changes before implementing them.
* Prefer minimal, maintainable solutions over unnecessary complexity.
