# Astroids Codex

A modern browser recreation of the classic **Asteroids** arcade experience with a switchable wireframe and shaded rendering mode. Pilot a nimble ship, blast apart drifting asteroids, outmaneuver UFOs, and chase a persistent high score.

## Features

- Responsive inertia-based ship controls with rotation, thrust, shooting, and hyperspace.
- Asteroids that split into smaller fragments when destroyed.
- UFO encounters with targeted enemy fire.
- Toggle between classic vector wireframe and modern shaded rendering styles at runtime.
- Local high score persistence and HUD overlay for score, lives, render mode, and mute status.
- Simple Web Audio sound effects for thrust, shooting, and explosions.
- Responsive layout that scales to the current browser window.

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in any modern desktop browser (Chrome, Firefox, Edge, Safari).
3. Press **Enter** to start playing.

No build step is required—everything runs using native ES modules. For local development with live reload you can serve the project via any static server, e.g.:

```bash
npx http-server .
```

Then browse to `http://localhost:8080` (or whichever port your server provides).

## Controls

| Action | Keyboard |
| --- | --- |
| Rotate | Left / Right arrows or `A` / `D` |
| Thrust | Up arrow or `W` |
| Shoot | Spacebar |
| Hyperspace | Left Shift |
| Toggle render mode | `M` |
| Toggle mute | `P` |
| Start / Restart | Enter |

## Render Modes

- **Wireframe** — faithfully mimics the original vector display using white strokes on a dark background.
- **Shaded** — fills ships, asteroids, and UFOs with subtle gradients for a modern take while preserving readability.

Toggle modes anytime with the `M` key. The last selected mode is stored in `localStorage` for future sessions.

## High Scores

The highest score achieved is stored in the browser's `localStorage` and displayed in the HUD and game over screen. Clearing browser storage resets the high score.

## Project Structure

```
.
├── docs/
│   └── asteroids_spec.md   # Detailed specification and design plan
├── index.html              # Game entry point
├── src/
│   ├── asteroid.js         # Asteroid class and helpers
│   ├── audio.js            # Web Audio sound synthesis
│   ├── bullet.js           # Bullet representation
│   ├── game.js             # Game manager and loop
│   ├── input.js            # Keyboard handling
│   ├── main.js             # Bootstraps the game
│   ├── ship.js             # Player ship logic
│   └── ufo.js              # UFO behaviour
├── style.css               # Global styles and HUD layout
└── README.md
```

## Specification

The complete design reference, including mechanics, rendering requirements, and acceptance criteria, lives in [`docs/asteroids_spec.md`](docs/asteroids_spec.md).

## Future Enhancements

- Add particle-based explosion effects and screen shake.
- Implement difficulty scaling tuned to the original arcade pacing.
- Expand audio design with stereo panning and additional cues.
- Consider adding cooperative multiplayer or challenge modes.
