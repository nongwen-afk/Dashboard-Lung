# Git Workflow

## Branches

### main

Stable branch.

Used for demo or production-ready code.

### dev

Active integration branch.

All feature work should merge into dev.

### feature/\*

Feature branches.

Example:

```text
feature/create-driver-schema
```

### chore/\*

Setup/config branches.

Example:

```text
chore/setup-database-connection
```

### docs/\*

Documentation branches.

Example:

```text
docs/create-project-bible
```

### fix/\*

Bug fix branches.

Example:

```text
fix/login-redirect
```

## Pull Requests

Every PR should target `dev`.

PR must include:

- Summary
- Changes
- Verification checklist
- Related issue

## Release

Merge `dev` into `main` when demo-ready.
