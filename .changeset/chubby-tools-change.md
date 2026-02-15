---
"@map-of-science/root": minor
---

Configure integration test infrastructure.

- Add `passThroughEnv` for Docker, Google, and OpenAlex env vars in `turbo.json`
- Add `.env.test.example` with required integration test env vars
- Pass API secrets (Google, OpenAlex) to CI workflow
- Add `.env*` to `.gitignore`
