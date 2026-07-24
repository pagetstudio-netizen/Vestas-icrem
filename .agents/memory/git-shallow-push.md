---
name: Git shallow push recovery
description: A Replit workspace may contain a shallow history whose missing parent prevents initializing an empty GitHub repository.
---

## Rule
Before pushing a Replit workspace to an empty GitHub repository, verify that the repository is not shallow and that every parent of the current branch exists locally.

**Why:** A shallow boundary is sent during the first push. If its parent object is absent locally, GitHub can reject the pack with `did not receive expected object` even when authentication and permissions are valid.

**How to apply:** Recover the missing history from another clone, bundle, or remote before pushing. Do not remove `.git/shallow` or recreate a root commit silently; the former exposes missing objects and the latter rewrites the remote history.