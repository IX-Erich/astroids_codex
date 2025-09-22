# Asteroids Browser Game Specification

## Overview

This project recreates Atari's 1979 arcade shooter **Asteroids** for modern web browsers while remaining faithful to the original feel. Players pilot a triangular spaceship in a wraparound 2D arena, avoiding and destroying drifting asteroids and occasional UFOs. The ship obeys inertia-based physics, so momentum persists until counteracted. Players score points by shooting asteroids and enemies while preserving limited lives. Local high scores are stored to track long-term performance. In addition to the classic wireframe look, the game introduces a modern shaded rendering mode that can be toggled at runtime.

## Core Mechanics

### Controls
- **Rotation**: Left / Right arrow keys (or `A` / `D`).
- **Thrust**: Up arrow (or `W`). Applies forward acceleration relative to the ship's nose; momentum persists after release.
- **Shoot**: Spacebar fires bullets from the ship's nose. Bullets are short-lived projectiles that travel straight ahead.
- **Hyperspace**: Left Shift teleports the ship to a random location after a brief invulnerability period.
- **Render Mode Toggle**: `M` switches between wireframe and shaded rendering.
- **Start / Restart**: Enter starts the game from the menu or restarts from the game over screen.
- **Mute Audio**: `P` toggles game audio on or off.

### Scoring
- **Large asteroid**: 20 points
- **Medium asteroid**: 50 points
- **Small asteroid**: 100 points
- **Large UFO**: 200 points
- **Small UFO**: 1000 points
- **UFO bullet dodge bonus**: None (challenge only)

### Object Behaviours
- **Ship**: Limited to three lives; loses one on collision with asteroids, UFOs, or enemy bullets. Respawns after a short delay. Hyperspace moves the ship to a random safe position but may still result in collisions if unlucky.
- **Asteroids**: Spawn as large rocks moving in random directions. When hit by bullets, large asteroids split into two medium ones, and medium asteroids split into two small fragments. Small asteroids are destroyed on impact. All asteroids wrap around screen edges.
- **Bullets**: Travel straight, limited to a fixed lifespan and maximum count to prevent spamming. Bullets do not wrap; they disappear when leaving the screen.
- **UFOs**: Appear randomly after a delay. Large UFOs fire inaccurate shots, while small UFOs aim directly at the player. UFOs traverse the arena horizontally, wrap around edges, and can be destroyed by the player's bullets.
- **Enemy Bullets**: Fired by UFOs toward the ship, dealing damage on contact.

### Game States
1. **Menu**: Displays title, controls summary, and prompt to start.
2. **Playing**: Active gameplay with HUD showing score, high score, lives, and render mode.
3. **Game Over**: Shows final score and high score with an option to restart.

### Vector Display Aesthetic
The classic mode mimics the original vector display using bright white outlines on a black background. Objects are drawn using stroked paths without fills, evoking glowing vector lines.

### High Score System
High scores are persisted using `localStorage`. When a run ends, if the player's score surpasses the stored high score, the new value is saved and displayed on the HUD and game over screen.

## Rendering Modes

### Wireframe Mode (Default)
- Ship, asteroids, UFOs, and bullets rendered with unfilled white stroke lines.
- Canvas background remains dark, emphasizing the neon vector look.
- HUD text uses a retro-styled monospace font.

### Shaded Mode
- Objects are filled with subtle gradients or flat colours:
  - **Ship**: Filled triangular polygon with a soft glow using a linear gradient.
  - **Asteroids**: Irregular convex polygons filled with muted greys and highlights to suggest depth.
  - **UFOs**: Disk-shaped body with radial gradient and small glowing highlights.
  - **Bullets**: Small glowing circles with outer transparency.
- Background remains dark to maintain contrast. Wireframe outlines may still be drawn for clarity.
- Mode indicator on HUD displays "Mode: Shaded".

### Switching Modes
- Player toggles between modes with the `M` key during gameplay or from the menu.
- Mode change is immediate and does not reset game state.
- Selected mode persists between sessions via `localStorage`.

## Architecture

### Modules / Classes
- **Vector2**: Utility for 2D vector math (addition, subtraction, scaling, length, normalization, wrapping).
- **Bullet**: Represents projectiles fired by the ship and UFOs. Handles lifetime, movement, collision radius, and drawing in both modes.
- **Ship**: Manages position, velocity, rotation, thrust, hyperspace, firing bullets, updating, and drawing. Tracks lives and handles respawn invulnerability.
- **Asteroid**: Stores position, velocity, size, and rotation. Splits into smaller asteroids when destroyed. Provides polygon vertices for drawing.
- **UFO**: Handles spawning, movement, firing behaviour, and drawing. Emits targeted bullets at intervals.
- **Particle** (optional polish): Used for simple explosion effects.
- **InputManager**: Tracks keyboard state, toggles, and prevents repeated actions.
- **AudioManager**: Generates thrust, shoot, and explosion sounds via Web Audio API with mute toggle.
- **GameManager**: Coordinates game loop, state transitions, collision detection, scoring, level progression, and HUD updates.

### Utilities
- **Random helpers**: e.g., `randomRange(min, max)`, `randomUnitVector()`.
- **Collision detection**: Circle-based collision checks for ship, asteroids, bullets, and UFOs.
- **Screen wrapping**: Repositions objects when they cross canvas boundaries.
- **Timer helpers**: Manage spawn delays and invulnerability windows.

## Acceptance Criteria
- Responsive controls with thrust-based inertia and accurate rotation.
- Asteroids split correctly into progressively smaller fragments until destroyed.
- UFOs spawn after increasing delays, move horizontally, and fire at the player.
- Collision detection reliably handles ship-asteroid, ship-UFO, ship-bullet, bullet-asteroid, and bullet-UFO interactions.
- Render mode toggle updates immediately, with both wireframe and shaded styles implemented for all objects.
- HUD displays score, high score, lives, and render mode indicator.
- Game maintains 60 FPS on modern desktop browsers at 1080p.
- High score and selected render mode persist via `localStorage`.
- Audio effects for thrust, shooting, and explosions are audible with mute option.
- Works on desktop browsers and gracefully scales canvas on mobile devices.

## Success Metrics
- Stable 60 FPS gameplay on Chrome, Firefox, and Edge.
- Input latency under 50 ms when thrusting and firing.
- High score persists after reloading the page.
- User tests report intuitive controls and clear mode switching.
- Minimal bundle size (<200 KB excluding audio) for fast loading.

