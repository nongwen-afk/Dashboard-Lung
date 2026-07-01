# Codex GitHub Cleanup Prompt

**Use this prompt only after the user confirms PR/merge status.**

You are responsible only for GitHub Issue and Project Board cleanup.

Do not modify code.
Do not create commits.
Do not push.
Do not open a new PR.
Do not merge anything.
Do not delete branches.
Do not touch unrelated issues, project boards, branches, or repositories.

Repo:
nongwen-afk/Dashboard-Lung

Read this handoff file first:
docs/agent-handoff/issues/issue-29-better-auth.md

User-confirmed status to fill in before running Codex cleanup:

- Code reviewed: yes/no
- PR opened: yes/no
- PR merged: yes/no
- Feature branch deleted: yes/no

Your tasks:

1. Open repo `nongwen-afk/Dashboard-Lung`.
2. Read `docs/agent-handoff/issues/issue-29-better-auth.md`.
3. Open Issue #29.
4. Confirm whether the related PR was merged.
5. Confirm whether the feature branch was deleted.
6. Update Issue #29 checklist items according to the completed implementation.
7. Post the completion comment from the handoff file if appropriate.
8. Update the GitHub Project Board fields for Issue #29:
   - If the PR is merged, set Status to Done.
   - If the PR is opened but not merged, set Status to In review.
   - Keep Priority, Size, and Iteration unchanged unless the project convention clearly requires an update.
9. Close Issue #29 only if the PR was merged and the implementation clearly completes the issue.
10. Do not touch Issue #17 except to respect the warning that `user_profiles` belongs there.
11. Report exactly what you changed.

Report back:

- whether the PR was confirmed merged
- whether the feature branch was confirmed deleted
- checklist items changed
- Project fields changed
- whether a comment was posted
- whether Issue #29 was closed or already closed
- any remaining cleanup needed
