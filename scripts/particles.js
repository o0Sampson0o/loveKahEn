// Floating-hearts particle effect.
//
// Runs an ambient stream of hearts/sparkles drifting up the screen, plus
// celebratory bursts on demand. Exposes a tiny API on `window.FX`:
//   FX.burst(x, y, count)  -> spray particles outward from (x, y)
//
// Pure canvas, no dependencies. Draws emoji as the particles so it stays
// lightweight and cheerful.

(function () {
  "use strict";

  const EMOJIS = ["❤️", "💕", "💖", "✨", "🌸", "💛", "🌟"];

  // Hard ceiling on live particles. Each one is an emoji fillText per frame —
  // the costliest part of the draw — so spam-clicking bursts must stay bounded
  // or the frame loop tanks. Ambient is throttled separately (<80).
  const MAX_PARTICLES = 100;

  const canvas = document.createElement("canvas");
  canvas.className = "fx-canvas";
  const ctx = canvas.getContext("2d");

  let W = 0;
  let H = 0;
  const particles = [];

  // Each emoji is pre-rendered once to its own little offscreen canvas, then
  // stamped with drawImage every frame. fillText (glyph shaping + rasterising)
  // per particle per frame is the real cost; drawImage of a cached bitmap is
  // cheap, so the frame loop scales to far more particles.
  const SPRITE_FONT = 64; // glyph render size inside the sprite
  const SPRITE_BOX = 80; // sprite canvas size: padding so glyphs never clip
  let sprites = {};

  function buildSprites() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sprites = {};
    for (const ch of EMOJIS) {
      const c = document.createElement("canvas");
      c.width = SPRITE_BOX * dpr;
      c.height = SPRITE_BOX * dpr;
      const cx = c.getContext("2d");
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.textAlign = "center";
      cx.textBaseline = "middle";
      cx.font = SPRITE_FONT + "px serif";
      cx.fillText(ch, SPRITE_BOX / 2, SPRITE_BOX / 2);
      sprites[ch] = c;
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // dpr may change (e.g. moving window between screens) — rebuild crisp.
    buildSprites();
  }

  function pick() {
    return EMOJIS[(Math.random() * EMOJIS.length) | 0];
  }

  // A heart that rises gently from the bottom and sways side to side.
  function spawnAmbient() {
    particles.push({
      x: Math.random() * W,
      y: H + 24,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.25 + Math.random() * 0.55),
      g: 0,
      life: 0,
      max: 9000 + Math.random() * 6000,
      size: 14 + Math.random() * 16,
      char: pick(),
      rot: (Math.random() - 0.5) * 0.6,
      vr: (Math.random() - 0.5) * 0.01,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.001 + Math.random() * 0.002,
      swayAmp: 0.2 + Math.random() * 0.4,
      ambient: true,
    });
  }

  // Drop up to n oldest burst particles (they sit earliest in push order),
  // leaving the ambient stream untouched, to free room for a fresh burst.
  function evictOldestBursts(n) {
    let removed = 0;
    for (let i = 0; i < particles.length && removed < n; ) {
      if (!particles[i].ambient) {
        particles.splice(i, 1);
        removed++;
      } else {
        i++;
      }
    }
  }

  // A celebratory spray outward from a point, with a little gravity.
  function burst(x, y, count) {
    count = count || 18;
    // Spam-clicking would otherwise pile up unbounded bursts; keep the newest
    // hearts by recycling the oldest ones when we're near the ceiling.
    const headroom = MAX_PARTICLES - particles.length;
    if (headroom < count) evictOldestBursts(count - headroom);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 4.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.5,
        g: 0.05,
        life: 0,
        max: 800 + Math.random() * 700,
        size: 16 + Math.random() * 18,
        char: pick(),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        ambient: false,
      });
    }
  }

  let last = performance.now();
  let ambientAcc = 0;

  function frame(now) {
    const dt = Math.min(now - last, 50);
    last = now;
    const f = dt / 16.67; // normalise motion to ~60fps

    // Trickle in ambient hearts (capped so it never gets busy).
    ambientAcc += dt;
    if (ambientAcc > 850) {
      ambientAcc = 0;
      if (particles.length < 80) spawnAmbient();
    }

    ctx.clearRect(0, 0, W, H);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      p.vy += p.g * f;
      p.x += p.vx * f;
      p.y += p.vy * f;
      if (p.ambient) {
        p.sway += p.swaySpeed * dt;
        p.x += Math.sin(p.sway) * p.swayAmp * f;
      }
      p.rot += p.vr * f;

      if (p.life >= p.max || p.y < -40) {
        particles.splice(i, 1);
        continue;
      }

      let alpha;
      if (p.ambient) {
        const fadeIn = Math.min(1, p.life / 600);
        const fadeOut = Math.min(1, (p.max - p.life) / 1200);
        alpha = Math.max(0, Math.min(fadeIn, fadeOut));
      } else {
        alpha = Math.max(0, 1 - p.life / p.max);
      }

      // Scale the cached sprite so the glyph appears at p.size: the box is
      // drawn proportionally larger than the glyph it contains.
      const draw = (p.size / SPRITE_FONT) * SPRITE_BOX;
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(sprites[p.char], -draw / 2, -draw / 2, draw, draw);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  function mount() {
    document.body.appendChild(canvas);
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
    // a gentle welcome burst on load
    setTimeout(() => burst(W / 2, H / 2, 24), 300);
  }

  window.FX = { burst: burst };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
