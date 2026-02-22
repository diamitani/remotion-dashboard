# Remotion Project Bootstrap Checklist (Agent-First)

Use this file as mandatory setup instructions for Codex, OpenCode, Claude Code, or any agent provisioning a Remotion project.

## 1) Project foundation

- [ ] Confirm Node.js 22+ and npm 10+.
- [ ] Run `npm install`.
- [ ] Run `./scripts/bootstrap-agent-instance.sh`.
- [ ] Ensure `.env` exists (copy from `.env.example` if needed).

## 2) Core Remotion libraries

- [ ] `remotion`
- [ ] `@remotion/player`
- [ ] `@remotion/google-fonts`
- [ ] `@remotion/fonts`
- [ ] `@remotion/paths`
- [ ] `@remotion/three`
- [ ] `three` + `@react-three/fiber`

## 3) Design/style libraries (non-generic look)

- [ ] `framer-motion` for UI motion choreography.
- [ ] `d3` for chart and data-driven visual systems.
- [ ] `gsap` for timeline-heavy orchestration where needed.
- [ ] `clsx` for token-based style composition.
- [ ] Apply brand tokens before building scenes (palette, typography, corner radius, easing presets).

## 4) Remotion animation rules (hard constraints)

- [ ] Use `useCurrentFrame()` for all render-time animation.
- [ ] Convert time in seconds to frames with `fps` from `useVideoConfig()`.
- [ ] Do not use CSS animations/transitions inside rendered compositions.
- [ ] Disable third-party chart/animation library autoplay/fx and drive values from frame.

## 5) Audio/TTS baseline

- [ ] Ensure Chatterbox TTS service is reachable in this environment.
- [ ] Store TTS endpoint + auth in environment variables (never hardcode secrets).
- [ ] Test one narration job before feature development.
- [ ] If Chatterbox is not preinstalled, local install:
  - [ ] `python3.11 -m venv venv`
  - [ ] `source venv/bin/activate`
  - [ ] `pip install chatterbox-tts`
  - [ ] `python -m chatterbox.tts --model chatterbox`

## 6) OpenCode integration baseline

- [ ] Verify OpenCode CLI installed and authenticated on target machine.
- [ ] Verify API key/config secrets are available to worker process.
- [ ] Confirm worker can: read project files, patch source, trigger preview render.

## 7) CI/CD baseline

- [ ] GitHub Actions workflow exists and passes (`npm ci`, `npm run build`).
- [ ] Azure deploy token configured in repo secrets:
  - [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN`
- [ ] Preview + production environments mapped to branches.

## 8) Done criteria

- [ ] Chat prompt updates a composition.
- [ ] Right-side preview reflects changes.
- [ ] Rendered clip matches brand system (not default Remotion style).
- [ ] Build and deploy are green.

## Article-linked libraries

- [x] Ingested article: `https://freefrontend.com/react-animation-library/`.
- [x] Installed npm packages:
  - [x] `@react-spring/web`
  - [x] `animejs`
  - [x] `motion`
  - [x] `react-bits`
  - [x] `react-swift-reveal`
  - [x] `moti`
  - [x] `lottie-react`
  - [x] `@animxyz/core`
  - [x] `@animxyz/react`
  - [x] `gsap`
  - [x] `scenejs`
  - [x] `react-flip-toolkit`
  - [x] `react-move`
  - [x] `animate-ui`
  - [x] `magicui-cli`
  - [x] `cursify` (installed with `--ignore-scripts`; canvas native deps still needed for full runtime)
  - [x] `react-motion` (installed with `--legacy-peer-deps`; legacy peer range, avoid in new code)
- [ ] Unresolvable package from article name:
  - [ ] `magicui` exact npm package not found on registry.
  - [ ] `@animate-ui/react` exact npm package not found on registry.
