# Remotion Visual Dashboard

Prompt-native dashboard for editing Remotion compositions with a chat workflow and live preview panel.

## SaaS scaffold

The app now includes:

- Landing page (`/`)
- Login page (`/login`)
- Project workspace with working chat and preview (`/app`)
- Workspace billing console with subscription plan/status controls
- BYOK connect/disconnect flow (OpenAI/Anthropic/other provider token modes)
- Auto top-up credit purchase simulation when subscription is active + payment method is attached
- Pluggable platform API layer (mock backend by default; real API when `VITE_API_BASE_URL` is set)

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Key docs

- `REMOTION_SETUP_CHECKLIST.md`
- `REMOTION_STACK_README.md`
- `PRD_REMOTION_VISUAL_DASHBOARD.md`
- `LLM_BUILD_PROMPT.md`
- `ARTICLE_LIBRARY_INSTALLS.md`
- `CHATTERBOX_TTS_SETUP.md`
- `SAAS_PLATFORM_MODEL.md`
