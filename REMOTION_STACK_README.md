# Remotion Style Stack

This stack is designed to avoid generic React-video output and push toward a coherent design system.

## Installed libraries

- `remotion`, `@remotion/player`: core rendering and preview.
- `@remotion/google-fonts`, `@remotion/fonts`: deterministic typography loading.
- `@remotion/paths`: line/path draw effects for charts and kinetic marks.
- `@remotion/three`, `three`, `@react-three/fiber`: controlled 3D scenes.
- `d3`: data-to-visual primitives.
- `framer-motion`, `gsap`: dashboard UI motion and workflow polish.
- `zod`: strict prompt payload schemas.
- `lucide-react`, `clsx`: UI system ergonomics.

## Design system standards

1. Typography: define one display family + one text family, with explicit scale.
2. Color: define semantic tokens (`bg`, `surface`, `text`, `accent`, `success`, `danger`).
3. Motion: define 3 timing curves + 3 durations and reuse them everywhere.
4. Layout: use fixed composition grids (12-col, 8pt spacing).
5. Scene architecture: each composition should declare theme tokens as props.

## Agent setup command

```bash
npm install
./scripts/bootstrap-agent-instance.sh
```

## Notes on Chatterbox TTS

Chatterbox can run as a local service for voiceover jobs:

```bash
python -m venv venv
source venv/bin/activate
pip install chatterbox-tts
python -m chatterbox.tts --model chatterbox
```

For API mode and hosted usage details, see `CHATTERBOX_TTS_SETUP.md`.

## Article libraries installed

Installed from article references (or closest npm equivalent):

- `@react-spring/web@10.0.3`
- `animejs@4.3.6`
- `motion@12.34.3`
- `react-bits@1.0.5`
- `react-swift-reveal@1.2.4`
- `moti@0.30.0`
- `lottie-react@2.4.1`
- `@animxyz/core@0.6.6`
- `@animxyz/react@0.6.7`
- `gsap@3.14.2`
- `scenejs@1.10.3`
- `react-flip-toolkit@7.2.4`
- `react-move@6.5.0`
- `animate-ui@0.0.4`
- `magicui-cli@0.1.6`
- `cursify@1.0.0` (installed with `--ignore-scripts`)
- `react-motion@0.5.2` (legacy peer dependency; do not use for new React 19 code)
