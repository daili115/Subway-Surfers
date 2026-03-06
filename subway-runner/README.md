# Neon Subway Runner

A complete Three.js endless runner inspired by classic 3-lane subway gameplay mechanics, using only original procedural assets and synthesized audio.

## Setup

1. Open a terminal in this folder.
2. Start a local static server (ES module imports require HTTP):
   ```bash
   python3 -m http.server 5173
   ```
3. Open your browser at:
   `http://localhost:5173/subway-runner/`

## Controls

- `Arrow Left`: Move left lane
- `Arrow Right`: Move right lane
- `Arrow Up`: Jump
- `Arrow Down`: Slide (0.7s)

## Visual Update

- Brighter city-subway palette (sky gradient + warm tracks)
- Moving side scenery (colorful buildings + trees)
- Overhead wire props and moving train traffic
- Improved player silhouette and speed-line screen effect

## Features Implemented

- Smooth lane switching (~200 ms)
- Physics jump with gravity/parabolic arc
- Slide with reduced hitbox
- Exponential speed scaling over time
- Random obstacle generation with avoid-impossible guardrails
- Coin pattern spawning (line, arc, zigzag)
- Bounding-box collision detection
- Procedural Web Audio sound effects + loop music
- Start/game-over UI with best score in localStorage
- Object pooling for obstacles/coins + segment recycling
