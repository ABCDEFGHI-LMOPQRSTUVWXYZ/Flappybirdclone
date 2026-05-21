# 🐦 Flappy Bird Clone

A browser-based Flappy Bird clone built with vanilla HTML5, CSS3, and JavaScript — no frameworks, no dependencies.

---

## 📁 Project Structure

```
flappy-bird/
├── index.html    # Game layout, canvas, and UI elements
├── style.css     # Styling, responsive layout, animations
└── script.js     # Game logic, physics, rendering, controls
```

---

## 🚀 Getting Started

No build step required. Just open `index.html` in any modern browser:

```bash
# Option 1: Open directly
open index.html

# Option 2: Serve locally (avoids any browser file restrictions)
npx serve .
# or
python3 -m http.server 8080
```

---

## 🎮 How to Play

| Action | Control |
|--------|---------|
| Flap up | `Space`, `↑`, Click, or Tap |
| Restart | `R` key or click **RESTART** button |
| Start game | Click **START GAME** button |

- Fly through the gaps between pipes to score points.
- Hitting a pipe, the ground, or the ceiling ends the game.
- Your best score is saved automatically in `localStorage`.

---

## 🧠 Code Overview

### `index.html`
- Renders the game container, score board, `<canvas>`, and control buttons.
- Links `style.css` and `script.js`.

### `style.css`
- Responsive layout centered on screen with a dark green background.
- Styled score cards, buttons with press animation, and canvas border.
- Mobile-friendly via `@media (max-width: 500px)`.

### `script.js`

#### Game State
| Variable | Purpose |
|----------|---------|
| `gameRunning` | Whether the game loop is active |
| `score` / `bestScore` | Current and all-time high score |
| `bird` | Position, velocity, gravity, and jump power |
| `pipes` | Array of active pipe objects |

#### Core Functions

| Function | Description |
|----------|-------------|
| `gameLoop()` | Main `requestAnimationFrame` loop |
| `updateGame()` | Physics, pipe movement, scoring, collision |
| `draw()` | Clears and redraws every frame |
| `drawBackground()` | Sky gradient, clouds, and ground |
| `drawBird()` | Animated bird with rotation based on velocity |
| `drawPipes()` | Top and bottom pipe pairs |
| `checkCollisions()` | AABB collision vs pipes, ground, and ceiling |
| `jump()` | Applies upward velocity to the bird |
| `startGame()` / `restartGame()` | Initialize and begin a new round |
| `resetGame()` | Reset all state to idle/pre-game |

#### Physics
- **Gravity:** `bird.velocity += 0.2` per frame
- **Jump:** `bird.velocity = -4.8`
- **Pipe speed:** `2.5px` per frame
- **Pipe spawn interval:** every `95` frames (~1.58s at 60fps)
- **Gap size:** `150px` between top and bottom pipes

---

## 💾 Persistence

Best score is stored in `localStorage` under the key `flappyBest` and persists across sessions.

---

## 📱 Mobile Support

- Touch events (`touchstart`) handled on the canvas.
- `user-scalable=no` prevents accidental zoom during gameplay.
- Canvas scales to full width on small screens via CSS.

---

## 🛠️ Customization

| Constant | Location | Effect |
|----------|----------|--------|
| `PIPE_GAP` | `script.js` | Vertical gap between pipes (default: `150`) |
| `PIPE_SPAWN_FRAMES` | `script.js` | Frames between pipe spawns (default: `95`) |
| `bird.gravity` | `script.js` | Fall acceleration (default: `0.2`) |
| `bird.jumpPower` | `script.js` | Jump strength (default: `-4.8`) |
| Pipe speed (`2.5`) | `updateGame()` | Horizontal scroll speed |

---

## 🌐 Browser Compatibility

Works in all modern browsers that support the HTML5 Canvas API:

- Chrome / Edge (recommended)
- Firefox
- Safari (desktop & iOS)
- Android Chrome
