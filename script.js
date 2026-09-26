// ============ CONFIG (mirrors python constants) ============
const WIDTH  = 2000;
const HEIGHT = 1200;
const BACKGROUND_COLOR = "#000000";
const FPS = 60;
const SCALE = 20;

const WORDS = ["love you", "Love You", "LOVE YOU"];
const CENTER_TEXT = " Love You ";
const COLORS = [
  [70, 130, 180],
  [30, 144, 255],
  [0, 191, 255],
  [100, 149, 237],
  [65, 105, 225]
];

// ============ CANVAS SETUP ============
const canvas = document.getElementById("scene");
canvas.width  = WIDTH;
canvas.height = HEIGHT;
const ctx = canvas.getContext("2d");

const glowLayer = document.createElement("canvas");
glowLayer.width = WIDTH;
glowLayer.height = HEIGHT;
const glowCtx = glowLayer.getContext("2d");

const textLayer = document.createElement("canvas");
textLayer.width = WIDTH;
textLayer.height = HEIGHT;
const textCtx = textLayer.getContext("2d");

// ============ HELPERS ============
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function rgbStr(c) { return `rgb(${c[0]},${c[1]},${c[2]})`; }

// ============ MATH ============
function heartXY(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
  return [x, -y];
}

function toScreen(x, y) {
  return [x * SCALE + WIDTH / 2, y * SCALE + HEIGHT / 2];
}

// ============ PARTICLE ============
class Particle {
  constructor(x, y, order, kind) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.kind = kind;
    this.word = WORDS[randInt(0, WORDS.length - 1)];
    this.color = COLORS[randInt(0, COLORS.length - 1)];
    this.alpha = 0;
    this.flicker = rand(0, Math.PI * 2);
    this.font = null;
    this.delay = 0;
    this.sizeMult = rand(0.85, 1.15);
    this._renderAlpha = 0;
  }
}

// ============ BUILDERS ============
function buildOutlineParticles(nOutline, minGap = 30) {
  const particles = [];
  const placed = [];
  for (let i = 0; i < nOutline; i++) {
    const t = (i / nOutline) * 2 * Math.PI;
    const [bx, by] = heartXY(t);
    const [sx, sy] = toScreen(bx, by);
    let tooClose = false;
    for (const [px, py] of placed) {
      if (Math.hypot(sx - px, sy - py) < minGap) { tooClose = true; break; }
    }
    if (tooClose) continue;
    placed.push([sx, sy]);
    particles.push(new Particle(sx, sy, i, "outline"));
  }
  return particles;
}

function buildFillParticles(nFill, minGap = 46) {
  const particles = [];
  const placed = [];
  let attempts = 0;
  const maxAttempts = nFill * 80;

  while (particles.length < nFill && attempts < maxAttempts) {
    attempts++;
    const t = rand(0, 2 * Math.PI);
    const r = rand(0.0, 0.86);
    const [bx, by] = heartXY(t);
    const px = bx * r, py = by * r;
    const [sx, sy] = toScreen(px, py);

    let tooClose = false;
    for (const [qx, qy] of placed) {
      if (Math.hypot(sx - qx, sy - qy) < minGap) { tooClose = true; break; }
    }
    if (tooClose) continue;

    placed.push([sx, sy]);
    particles.push(new Particle(sx, sy, randInt(0, 320), "fill"));
  }
  return particles;
}

// ============ FONT ============
function makeFont(size, family = "Arial", bold = true) {
  return `${bold ? "bold " : ""}${size}px ${family}`;
}

// ============ GLOW TEXT ============
function drawGlowText(fontSpec, word, color, x, y, alpha, sizeMult = 1.0) {
  if (alpha <= 0) return;

  const baseSize = parseInt(fontSpec.match(/(\d+)px/)[1], 10);
  const scaledSize = sizeMult !== 1.0 ? Math.round(baseSize * sizeMult) : baseSize;
  const familyMatch = fontSpec.match(/px\s+(.*)$/);
  const family = familyMatch ? familyMatch[1] : "Arial";
  const boldMatch = fontSpec.startsWith("bold");
  const useFont = `${boldMatch ? "bold " : ""}${scaledSize}px ${family}`;

  textCtx.font = useFont;
  textCtx.textAlign = "center";
  textCtx.textBaseline = "middle";
  textCtx.globalAlpha = alpha / 255;

  if (alpha > 10) {
    glowCtx.font = useFont;
    glowCtx.textAlign = "center";
    glowCtx.textBaseline = "middle";

    glowCtx.globalAlpha = Math.max(0, Math.floor(alpha / 7)) / 255;
    glowCtx.save();
    glowCtx.translate(x, y);
    glowCtx.scale(2.4, 2.4);
    glowCtx.fillStyle = rgbStr(color);
    glowCtx.fillText(word, 0, 0);
    glowCtx.restore();

    glowCtx.globalAlpha = Math.max(0, Math.floor(alpha / 3)) / 255;
    glowCtx.save();
    glowCtx.translate(x, y);
    glowCtx.scale(1.6, 1.6);
    glowCtx.fillStyle = rgbStr(color);
    glowCtx.fillText(word, 0, 0);
    glowCtx.restore();
  }

  textCtx.fillStyle = rgbStr(color);
  textCtx.fillText(word, x, y);

  textCtx.globalAlpha = 1;
  glowCtx.globalAlpha = 1;
}

// ============ AUDIO ============
const song = document.getElementById("song");
song.volume = 1.0;
function tryPlay() { song.play().catch(() => {}); }
window.addEventListener("click", tryPlay, { once: true });
window.addEventListener("keydown", tryPlay, { once: true });
tryPlay();

// ============ FONTS ============
const fontOutline = makeFont(20, "Arial", true);
const fontFill    = makeFont(17, "Arial", true);
const fontCenter  = makeFont(54, "Georgia", true);

// ============ BUILD PARTICLES ============
const outline = buildOutlineParticles(160);
const fill    = buildFillParticles(130);

const outlineSpan = outline.length ? Math.max(...outline.map(p => p.order)) : 0;
const framesPerStep = 1.6;
const fillStartFrame = Math.floor(outlineSpan * framesPerStep) + 30;

for (const p of fill)    p.delay = fillStartFrame + p.order;
for (const p of outline) p.delay = Math.floor(p.order * framesPerStep);

const particles = outline.concat(fill);
for (const p of particles) p.font = p.kind === "outline" ? fontOutline : fontFill;

// ============ LOOP ============
let running = true;
let frame = 0;
let lastTime = performance.now();
const frameInterval = 1000 / FPS;
let accumulator = 0;

function update() {
  frame++;

  for (const p of particles) {
    if (frame > p.delay && p.alpha < 255) {
      p.alpha = Math.min(255, p.alpha + 14 + randInt(0, 4));
    }

    let flick;
    if (p.alpha >= 255) {
      flick = 0.75 + 0.25 * Math.sin(frame * 0.04 + p.flicker);
    } else {
      flick = 1.0;
    }

    p._renderAlpha = Math.floor(p.alpha * flick);
  }
}

function render() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  glowCtx.clearRect(0, 0, WIDTH, HEIGHT);
  textCtx.clearRect(0, 0, WIDTH, HEIGHT);

  for (const p of particles) {
    if (!p._renderAlpha || p._renderAlpha <= 0) continue;
    drawGlowText(p.font, p.word, p.color, p.x, p.y, p._renderAlpha, p.sizeMult);
  }

  ctx.drawImage(glowLayer, 0, 0);
  ctx.drawImage(textLayer, 0, 0);

  const centerStart = fillStartFrame + 200;
  if (frame > centerStart) {
    const progress = Math.min(1.0, (frame - centerStart) / 60);
    const centerAlpha = Math.floor(255 * (1 - Math.exp(-progress * 8)));
    const pulse = 1.0 + 0.025 * Math.sin(frame * 0.05);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const pulsedSize = 54 * pulse;

    if (centerAlpha > 10) {
      ctx.save();
      ctx.translate(WIDTH / 2, HEIGHT / 2);
      ctx.scale(1.4, 1.4);
      ctx.font = makeFont(pulsedSize, "Georgia", true);
      ctx.globalAlpha = Math.floor(centerAlpha / 5) / 255;
      ctx.fillStyle = "rgb(255,250,245)";
      ctx.fillText(CENTER_TEXT, 0, 0);
      ctx.restore();
    }

    ctx.globalAlpha = centerAlpha / 255;
    ctx.font = makeFont(pulsedSize, "Georgia", true);
    ctx.fillStyle = "rgb(255,250,245)";
    ctx.fillText(CENTER_TEXT, WIDTH / 2, HEIGHT / 2);
    ctx.restore();
  }
}

function loop(now) {
  if (!running) return;
  requestAnimationFrame(loop);

  const delta = now - lastTime;
  lastTime = now;
  accumulator += delta;
  if (accumulator < frameInterval) return;

  while (accumulator >= frameInterval) {
    accumulator -= frameInterval;
    update();
  }
  render();
}

// ============ RESIZE ============
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = Math.min(w / WIDTH, h / HEIGHT);
  canvas.style.width  = (WIDTH * scale) + "px";
  canvas.style.height = (HEIGHT * scale) + "px";
  canvas.style.position = "absolute";
  canvas.style.left = ((w - WIDTH * scale) / 2) + "px";
  canvas.style.top  = ((h - HEIGHT * scale) / 2) + "px";
}
window.addEventListener("resize", resize);
resize();

// ============ ESC QUIT ============
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") running = false;
});

requestAnimationFrame((t) => { lastTime = t; loop(t); });