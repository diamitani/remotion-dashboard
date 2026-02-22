# Chatterbox TTS Setup

Source docs:
- https://www.chatterboxtts.com/docs
- https://github.com/resemble-ai/chatterbox

This device is treated as already provisioned with Chatterbox by operator setup.  
Use this file as a fallback runbook for fresh machines or CI workers.

## Local setup (Python)

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install chatterbox-tts
python -m chatterbox.tts --model chatterbox
```

## API server setup

```bash
pip install chatterbox-tts[api]
python -m chatterbox.tts.server
```

Default API docs endpoint:

- `http://localhost:8000/docs`

## Production notes for this project

- Run Chatterbox in a dedicated worker/service, not in the frontend process.
- Set environment variables for endpoint and auth token in deployment target.
- Use queue-based narration jobs so Remotion renders are not blocked by TTS generation.

## Important compatibility note

The official docs note potential issues with non-CUDA / non-Linux configurations in some cases. Validate target runtime (local, Azure container, or VM) before relying on production traffic.

## Troubleshooting from this machine

- If you need to reprovision on a new machine, prefer Python 3.11.
