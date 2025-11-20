# Dozzi App

A concept version for project Dozzi, build with Google AI Studio first, but has changed to independent github repo.

> [!warning]
> The App is still in development.

## Github Action

A action for building APK would be triggered if

- using workflow_dispatch (manually rerun)
- create release on Github
- When the push contains tag [v*]
   - e.g. `git tag v1.0.0 && git push`