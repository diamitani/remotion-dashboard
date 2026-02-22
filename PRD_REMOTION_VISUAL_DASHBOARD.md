# PRD: Remotion Visual Dashboard

## Product vision

A prompt-native video editor where users describe changes in chat, an agent patches Remotion code in the background, and the preview updates instantly in a right-side dashboard panel.

## Target users

- Creators iterating social video quickly.
- Teams producing brand-consistent clips at scale.
- Agencies that want a "design system for motion" workflow.

## Problem

Current text-to-video flows are either rigid templates or disconnected from source code. We need prompt control + deterministic code output + live preview.

## Core UX

1. User signs up/signs in.
2. User connects a project/workspace.
3. User enters prompt in chat.
4. Backend orchestrates OpenCode worker:
   - parse prompt
   - patch Remotion project
   - run preview render job
5. Preview URL updates in right panel.
6. User accepts/iterates/exports.

## Functional requirements

- Auth: Azure AD B2C or equivalent.
- Workspace provisioning: per-user project sandbox.
- Agent execution: OpenCode worker with scoped filesystem + secret access.
- Remotion orchestration: render preview, track job state, expose URL.
- Versioning: every prompt creates a revision entry.
- TTS: Chatterbox voiceover generation step available in pipeline.

## Non-functional requirements

- P95 preview update under 10s for style-only edits.
- Job isolation between users.
- Audit logs for prompt, patch, render metadata.
- Secret safety: no API keys in frontend bundle.

## System architecture

- Frontend (this repo): React dashboard UI.
- API gateway: auth/session + job APIs.
- Worker service: OpenCode execution runtime.
- Render service: Remotion render queue + object storage.
- TTS service: Chatterbox endpoint for narration assets.
- Data store: users, projects, revisions, jobs, assets.

## API shape (draft)

- `POST /api/jobs` create edit/render job.
- `GET /api/jobs/:id` get status.
- `GET /api/projects/:id/revisions` list timeline.
- `POST /api/tts` create narration asset.

## Milestones

1. MVP (2-3 weeks)
- Auth, chat UI, preview panel, mocked job lifecycle, manual Remotion link.

2. Alpha (4-6 weeks)
- Real OpenCode workers, patch pipeline, render status streaming.

3. Beta (6-10 weeks)
- Team workspaces, revision diff, Chatterbox voice presets, billing hooks.

## Success metrics

- Time-to-first-preview < 5 minutes after signup.
- Median prompt-to-preview under 15s.
- Weekly active creators and render count growth.
