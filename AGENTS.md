# EVA Music architecture
- Personalized queues use the authenticated Lovable-hosted streaming API; never put AI prompts or gateway credentials in browser or APK code.
- Select queues only from full-audio catalog candidates and preserve returned ID order; previews must not be replaced with unrelated songs.
- Configure only a publishable/anon account key through build environment variables; privileged credentials must never be bundled into the client.
- New personalized-queue controls share Button and global semantic color tokens to preserve theme behavior.
