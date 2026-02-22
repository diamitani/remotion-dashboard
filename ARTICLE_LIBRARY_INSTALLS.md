# Article Library Install Report

Source article: https://freefrontend.com/react-animation-library/
Install date: 2026-02-22

## Installed successfully

- @react-spring/web
- animejs
- motion
- react-bits
- react-swift-reveal
- moti
- lottie-react
- @animxyz/core
- @animxyz/react
- gsap
- scenejs
- react-flip-toolkit
- react-move
- animate-ui
- magicui-cli

## Installed with caveats

- cursify
  - Installed with `--ignore-scripts` because native `canvas` dependency failed to compile (missing `pixman`/native build chain on this machine).
- react-motion
  - Installed with `--legacy-peer-deps` due old React peer range (`^0.14 || ^15 || ^16`).

## Not installable as named package

- magicui
  - `magicui` is not a published npm package under that exact name in npm registry.
- @animate-ui/react
  - Scoped package not found in npm registry; root package `animate-ui` is installed instead.
