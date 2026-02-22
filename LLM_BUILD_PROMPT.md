# Prompt: Build The Remotion Visual Dashboard

You are building a production-ready frontend for a prompt-driven Remotion editor.

## Product behavior

- Left panel: chat interface for edit prompts.
- Right panel: live preview URL/player for the current Remotion revision.
- Prompt submission triggers a background job request and status polling.
- Job results update revision timeline and preview.

## Technical requirements

- Stack: React + TypeScript + Vite.
- Styling: token-based design system (no default UI look).
- State: explicit job lifecycle (`idle -> queued -> running -> success|error`).
- Validation: Zod schemas for all request/response contracts.
- Accessibility: keyboard support, contrast-safe text, focus-visible controls.

## Integrations

- Auth provider (Azure AD B2C or pluggable).
- API routes for job creation/status/revision list.
- OpenCode worker backend (external) for source patching.
- Remotion preview URL ingestion and refresh.
- Chatterbox TTS service hooks for narration jobs.

## Output expectations

1. Implement:
- `ChatPanel`, `PreviewPanel`, `JobTimeline`, `SettingsDrawer` components.
- API client with typed contracts.
- Error boundaries and loading states.

2. Include tests:
- Prompt submit flow.
- Job state transitions.
- Preview refresh after job success.

3. Include deployment:
- GitHub Actions build pipeline.
- Azure Static Web Apps deploy config.

4. Keep architecture clean:
- `features/chat`, `features/preview`, `features/jobs`, `features/settings`, `shared/ui`, `shared/api`.

Return complete code with exact files changed and runnable commands.
