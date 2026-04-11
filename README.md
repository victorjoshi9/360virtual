# 360virtual

360virtual includes two parts:

1. Python business agent module
2. Full-stack mobile-first 360 tour platform

## Python Business Agent

### Setup

```bash
pip install --upgrade -r requirements.txt
```

### Usage

```python
from business_agent import BusinessAgent

agent = BusinessAgent()
print(agent.process("upgrade upgrade"))
```

Run directly:

```bash
python business_agent.py
```

## Web + Mobile Apps

This repo now ships a workspace monorepo:

- `apps/web` (Next.js): mobile-first 360 viewer, floor selector, hotspots, share mode (`?mode=viewer`)
- `apps/mobile` (Expo React Native): live camera preview, gyro tracking, crosshair capture, ghost overlay

### Install

```bash
npm install
```

### Run Web Viewer

```bash
npm run web
```

Open:

- `http://localhost:3000/tour/demo`
- `http://localhost:3000/tour/demo?mode=viewer`

### Run Mobile Capture App

```bash
npm run mobile
```

Then use Expo QR flow to open the app on a device.
