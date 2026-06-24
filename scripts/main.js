// Anniversary page.
//
// Behaviour: each tap throws the CURRENT centered pop-up onto the "table"
// (random spot + slight tilt, where it stays scattered) and reveals a new
// random pop-up in the center. A pop-up is either a chat-message bubble
// (mixed sent/received) or an image.
//
// The content (MESSAGES and IMAGES) lives in scripts/data.js, which loads
// before this file; edit memories there. This file is just the behaviour.

"use strict";

// --- Setup -------------------------------------------------------------------

const table = document.getElementById("table"); // scroll container
const surface = document.getElementById("surface"); // the canvas pop-ups live on
const intro = document.getElementById("intro"); // opening splash
const tossHint = document.getElementById("toss-hint");
const counterEl = document.getElementById("counter"); // live memories tally
const bgm = document.getElementById("bgm"); // background music
const musicToggle = document.getElementById("music-toggle");

let current = null; // the live pop-up floating in the centre, waiting to be thrown
let surfaceW = 0; // size of the scrollable canvas (set in init)
let surfaceH = 0;
let memories = 0; // how many pop-ups have been revealed so far

const DENSITY = 5; // max weight per screen-sized area before it's "crowded"
const MARGIN = 90; // keep thrown items this far from an area's edges (px)
const DEFAULT_RADIUS = 60; // fallback footprint radius if an item isn't measured

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// A "shuffle bag": hands out every item once (in random order) before any
// repeats, and never returns the same item twice in a row. This gives an even
// spread instead of uniform-random's lucky clusters and back-to-back dupes.
function createBag(items) {
  let queue = [];
  let last = null;

  function refill() {
    queue = shuffle(items.slice());
    // Avoid an immediate repeat across the reshuffle boundary.
    if (queue.length > 1 && queue[queue.length - 1] === last) {
      const j = Math.floor(Math.random() * (queue.length - 1));
      const end = queue.length - 1;
      [queue[end], queue[j]] = [queue[j], queue[end]];
    }
  }

  return function next() {
    if (queue.length === 0) refill();
    last = queue.pop();
    return last;
  };
}

// A MESSAGES entry is either a single line (object) or a group: an array of
// lines shown together as one self-contained snippet. Split them so single
// lines can still be sender-balanced; groups get their own rotation.
const GROUPS = MESSAGES.filter(Array.isArray);
const SINGLES = MESSAGES.filter((m) => !Array.isArray(m));

// Split single lines by sender so we can balance how often each side appears.
// She wrote fewer messages, so plain shuffling would show hers less often.
const HER_MESSAGES = SINGLES.filter((m) => m.from === "her");
const ME_MESSAGES = SINGLES.filter((m) => m.from === "me");

// Chance that a shown single line is hers. 0.5 = both sides equally often;
// 0.55 makes hers appear a bit more than yours. Tune to taste.
const HER_SHARE = 0.55;

// Chance a shown message pop-up is a grouped snippet rather than a single line.
const GROUP_SHARE = 0.25;

const nextHerMessage = createBag(HER_MESSAGES);
const nextMeMessage = createBag(ME_MESSAGES);
const nextGroup = GROUPS.length ? createBag(GROUPS) : null;
const nextImage = createBag(IMAGES);

function nextMessage() {
  if (nextGroup && Math.random() < GROUP_SHARE) return nextGroup();
  const useHer =
    HER_MESSAGES.length && (!ME_MESSAGES.length || Math.random() < HER_SHARE);
  return useHer ? nextHerMessage() : nextMeMessage();
}

// --- Building pop-ups --------------------------------------------------------

function buildMessage() {
  const unit = nextMessage();
  // A unit is either one line or a group of lines; render them as a stack of
  // bubbles in a single self-contained pop-up.
  const lines = Array.isArray(unit) ? unit : [unit];

  const el = document.createElement("div");
  el.className = "popup is-msg";
  // A group occupies far more space than a single line, so it counts for more
  // when judging how crowded an area is (see DENSITY / loadInRect).
  el.dataset.weight = Array.isArray(unit) ? "3" : "1";

  lines.forEach((msg, i) => {
    const bubble = document.createElement("div");
    bubble.className = "bubble " + (msg.from === "me" ? "sent" : "recv");

    const body = document.createElement("span");
    body.className = "bubble-text";
    body.textContent = msg.text;
    bubble.appendChild(body);

    // Date/time live on the first line only (a group is timestamped once). They
    // form a small meta line that shows while live and hides once thrown.
    if (i === 0) {
      const meta = [msg.date, msg.time].filter(Boolean).join(" · ");
      if (meta) {
        const metaEl = document.createElement("span");
        metaEl.className = "bubble-meta";
        metaEl.textContent = meta;
        bubble.appendChild(metaEl);
      }
    }

    el.appendChild(bubble);
  });

  return el;
}

function buildImage() {
  const data = nextImage();

  const el = document.createElement("div");
  el.className = "popup is-image";
  el.dataset.weight = "1";

  const polaroid = document.createElement("figure");
  polaroid.className = "polaroid";

  const img = document.createElement("img");
  img.className = "polaroid-img";
  img.src = data.src;
  img.alt = data.title || "";
  polaroid.appendChild(img);

  // Caption is only added when there's something to show.
  if (data.title || data.date || data.description) {
    const cap = document.createElement("figcaption");
    cap.className = "polaroid-caption";

    if (data.title) {
      const t = document.createElement("div");
      t.className = "polaroid-title";
      t.textContent = data.title;
      cap.appendChild(t);
    }
    if (data.description) {
      const d = document.createElement("div");
      d.className = "polaroid-desc";
      d.textContent = data.description;
      cap.appendChild(d);
    }
    if (data.date) {
      const dt = document.createElement("div");
      dt.className = "polaroid-date";
      dt.textContent = data.date;
      cap.appendChild(dt);
    }
    polaroid.appendChild(cap);
  }

  el.appendChild(polaroid);
  return el;
}

// Pick a pop-up type. Falls back to messages when there are no images yet.
function buildPopup() {
  const useImage = IMAGES.length > 0 && Math.random() < 0.4;
  return useImage ? buildImage() : buildMessage();
}

// --- Surface setup -----------------------------------------------------------

// The table is several screens wide/tall so there's room to scatter things.
// We start scrolled to the middle so the pile can grow in every direction.
function init() {
  surfaceW = table.clientWidth * 5;
  surfaceH = table.clientHeight * 5;
  surface.style.width = surfaceW + "px";
  surface.style.height = surfaceH + "px";
  table.scrollLeft = table.clientWidth * 2;
  table.scrollTop = table.clientHeight * 2;
}

// --- Crowding + spot-finding -------------------------------------------------

function thrownItems() {
  return Array.from(surface.querySelectorAll(".popup.thrown"));
}

// A thrown item's point IS its centre (it's translated by -50%, -50%).
function centerOf(el) {
  return { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
}

function weightOf(el) {
  return parseFloat(el.dataset.weight) || 1;
}

function radiusOf(el) {
  return parseFloat(el.dataset.radius) || DEFAULT_RADIUS;
}

// Total weight (not raw count) of items whose centre falls in the rect. A group
// weighs more than a single line, so a few groups crowd an area like many lines.
function loadInRect(items, x0, y0, w, h) {
  let load = 0;
  for (const el of items) {
    const c = centerOf(el);
    if (c.x >= x0 && c.x <= x0 + w && c.y >= y0 && c.y <= y0 + h) {
      load += weightOf(el);
    }
  }
  return load;
}

// Pick a point inside a rectangle, biased towards open space. "Open" accounts
// for footprints: the surface gap is centre-distance minus both radii, so a
// landing spot is judged by how much clear space is actually left around the
// incoming item — preventing a big group from overlapping its neighbours.
function spotInRect(items, x0, y0, w, h, incomingRadius) {
  const r = incomingRadius || DEFAULT_RADIUS;
  let best = null;
  let bestGap = -Infinity;
  for (let i = 0; i < 16; i++) {
    const x = rand(x0 + MARGIN, x0 + w - MARGIN);
    const y = rand(y0 + MARGIN, y0 + h - MARGIN);
    let gap = Infinity; // smallest clear surface gap to any neighbour
    for (const el of items) {
      const c = centerOf(el);
      const surfaceGap = Math.hypot(c.x - x, c.y - y) - radiusOf(el) - r;
      gap = Math.min(gap, surfaceGap);
    }
    if (gap > bestGap) {
      bestGap = gap;
      best = { x, y };
    }
    if (gap > 40) break; // comfortable clearance around the item — good enough
  }
  return best;
}

// Decide where a thrown pop-up should land. If the current screen-area is
// already at DENSITY (by weight), look to a neighbouring area and report the
// direction. `incomingRadius` is the footprint of the item being thrown, so a
// large group is given enough clearance not to overlap what's already there.
function chooseSpot(incomingRadius) {
  const x0 = table.scrollLeft;
  const y0 = table.scrollTop;
  const w = table.clientWidth;
  const h = table.clientHeight;
  const items = thrownItems();

  if (loadInRect(items, x0, y0, w, h) < DENSITY) {
    return { ...spotInRect(items, x0, y0, w, h, incomingRadius), direction: null };
  }

  // Crowded here — try neighbouring areas (random order so it varies).
  const neighbours = shuffle([
    { direction: "up", dx: 0, dy: -1 },
    { direction: "down", dx: 0, dy: 1 },
    { direction: "left", dx: -1, dy: 0 },
    { direction: "right", dx: 1, dy: 0 },
  ]);
  for (const n of neighbours) {
    const nx = x0 + n.dx * w;
    const ny = y0 + n.dy * h;
    if (nx < 0 || ny < 0 || nx + w > surfaceW || ny + h > surfaceH) continue;
    if (loadInRect(items, nx, ny, w, h) < DENSITY) {
      return {
        ...spotInRect(items, nx, ny, w, h, incomingRadius),
        direction: n.direction,
      };
    }
  }

  // Everything nearby is full — just drop it somewhere in view.
  return { ...spotInRect(items, x0, y0, w, h, incomingRadius), direction: null };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Directional toss hint ---------------------------------------------------

const ARROWS = { up: "↑", down: "↓", left: "←", right: "→" };
let tossHintTimer = null;

function showTossHint(direction) {
  tossHint.textContent = ARROWS[direction] + " thrown over there";
  tossHint.className = "toss-hint show " + direction;
  clearTimeout(tossHintTimer);
  tossHintTimer = setTimeout(() => tossHint.classList.remove("show"), 1700);
}

// --- Throw + reveal ----------------------------------------------------------

// Demote the live pop-up onto the table: freeze it where it visually is, then
// glide it to a chosen (possibly off-screen) spot with a slight tilt.
function throwCurrent() {
  const el = current;

  // Where it sits right now, in surface coordinates (it was screen-centred).
  const fromX = table.scrollLeft + table.clientWidth / 2;
  const fromY = table.scrollTop + table.clientHeight / 2;

  // Switching off .current flips the pop-up from fixed (screen-centred) to
  // absolute on the surface, where `left` would otherwise revert to ~0,0. With
  // the transition live, it'd then glide in from the page origin. So snap it to
  // its current visual spot with the transition disabled, commit, then restore.
  el.classList.remove("current"); // becomes absolute on the surface
  el.style.transition = "none";
  el.style.left = fromX + "px";
  el.style.top = fromY + "px";
  void el.offsetWidth; // commit that starting point with no animation
  el.style.transition = ""; // restore the CSS glide for the move below

  // Footprint once it settles on the table. offsetWidth/Height are the layout
  // size (transform-independent); the thrown scale shrinks it (images most).
  const scale = el.classList.contains("is-image") ? 0.45 : 0.85;
  const fw = el.offsetWidth * scale;
  const fh = el.offsetHeight * scale;
  const radius = 0.5 * Math.hypot(fw, fh);
  el.dataset.radius = String(radius);

  const dest = chooseSpot(radius);
  el.classList.add("thrown");
  el.style.setProperty("--tilt", rand(-14, 14) + "deg");
  el.style.left = dest.x + "px";
  el.style.top = dest.y + "px";

  // A happy little burst from the centre of the screen as it's tossed.
  if (window.FX) FX.burst(window.innerWidth / 2, window.innerHeight / 2, 18);

  if (dest.direction) showTossHint(dest.direction);
}

function revealNew() {
  const el = buildPopup();
  el.classList.add("entering", "current"); // floats fixed in the screen centre
  surface.appendChild(el);
  el.addEventListener("animationend", () => el.classList.remove("entering"), {
    once: true,
  });
  current = el;
  bumpCounter();
}

// --- Live memories counter ---------------------------------------------------

function bumpCounter() {
  memories++;
  counterEl.textContent = "♡ " + memories;
  counterEl.classList.add("show");
  // brief pop animation each time it changes
  counterEl.classList.remove("pop");
  void counterEl.offsetWidth;
  counterEl.classList.add("pop");
}

function handleTap() {
  if (current) throwCurrent();
  revealNew();
}

// Mouse: hold-and-drag pans the table, a plain click throws. Touch is left to
// the browser's native scrolling (swipe to pan, tap to throw) so mobile is
// unaffected — we only take over for pointerType "mouse".
let mousePanning = false;
let movedWhilePanning = false;
let panStartX = 0;
let panStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;
const PAN_THRESHOLD = 6; // px before a press counts as a drag (suppresses throw)

table.addEventListener("pointerdown", (e) => {
  movedWhilePanning = false; // reset for every press (any input type)
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  mousePanning = true;
  panStartX = e.clientX;
  panStartY = e.clientY;
  scrollStartX = table.scrollLeft;
  scrollStartY = table.scrollTop;
  table.classList.add("grabbing");
  table.setPointerCapture(e.pointerId); // keep getting moves if cursor leaves
});

table.addEventListener("pointermove", (e) => {
  if (!mousePanning) return;
  const dx = e.clientX - panStartX;
  const dy = e.clientY - panStartY;
  if (!movedWhilePanning && Math.hypot(dx, dy) > PAN_THRESHOLD) {
    movedWhilePanning = true;
  }
  if (movedWhilePanning) {
    table.scrollLeft = scrollStartX - dx;
    table.scrollTop = scrollStartY - dy;
  }
});

function endMousePan() {
  if (!mousePanning) return;
  mousePanning = false;
  table.classList.remove("grabbing");
}

table.addEventListener("pointerup", (e) => {
  if (e.pointerType === "mouse") endMousePan();
});
table.addEventListener("pointercancel", (e) => {
  if (e.pointerType === "mouse") endMousePan();
});

table.addEventListener("click", () => {
  // If this click ended a drag, it was a pan — don't throw.
  if (movedWhilePanning) {
    movedWhilePanning = false;
    return;
  }
  handleTap();
});

// --- Opening splash: show the day count, tap to begin ------------------------

// Whole days from START_DATE to today. Both dates are normalised to midnight so
// the count is exact regardless of the time of day she opens it.
function daysTogether() {
  const start = new Date(
    START_DATE.getFullYear(),
    START_DATE.getMonth(),
    START_DATE.getDate(),
  );
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // +1 so the day you got together counts as day 1 (inclusive count).
  return Math.max(1, Math.round((today - start) / 86400000) + 1);
}

function formatStartDate() {
  const d = START_DATE;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `since ${dd}-${mm}-${d.getFullYear()}`;
}

function showIntro() {
  document.getElementById("intro-count").textContent = daysTogether();
  document.getElementById("intro-since").textContent = formatStartDate();
  // First tap anywhere on the splash dismisses it and reveals the first pop-up.
  intro.addEventListener(
    "click",
    () => {
      intro.classList.add("hidden");
      startMusic(); // first user gesture — browsers allow audio to start now
      if (window.FX)
        FX.burst(window.innerWidth / 2, window.innerHeight / 2, 28);
      revealNew();
    },
    { once: true },
  );
}

// --- Background music (shuffled playlist) ------------------------------------

// Songs play one after another in random order, with a short gap between them,
// and never the same song twice in a row.
const PLAYLIST = [
  "assets/audio/song.mp3",
  "assets/audio/song1.mp3",
  "assets/audio/song3.mp3",
];
const SONG_GAP_MS = 3000; // silence between songs

let playerActive = false; // whether music is meant to be playing
let lastSong = null; // to avoid back-to-back repeats
let gapTimer = null; // the pending "start next song" timer

function pickSong() {
  let choices = PLAYLIST;
  if (PLAYLIST.length > 1 && lastSong) {
    choices = PLAYLIST.filter((s) => s !== lastSong);
  }
  const song = choices[Math.floor(Math.random() * choices.length)];
  lastSong = song;
  return song;
}

function playNextSong() {
  clearTimeout(gapTimer);
  bgm.src = pickSong();
  bgm.currentTime = 0;
  const p = bgm.play();
  if (p && p.catch) p.catch(() => {}); // ignore if blocked / file missing
  setTimeout(updateMusicButton, 50);
}

// When a song finishes, wait the gap then play another.
bgm.addEventListener("ended", () => {
  if (!playerActive) return;
  gapTimer = setTimeout(playNextSong, SONG_GAP_MS);
});

function updateMusicButton() {
  musicToggle.textContent = playerActive ? "🔊" : "🔇";
  musicToggle.classList.toggle("muted", !playerActive);
}

function startMusic() {
  bgm.volume = 0.5;
  playerActive = true;
  playNextSong(); // first user gesture — start the playlist
}

// Tapping the button toggles music. stopPropagation so it doesn't also count
// as a tap on the table.
musicToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  if (playerActive && !bgm.paused) {
    // turn off
    playerActive = false;
    clearTimeout(gapTimer);
    bgm.pause();
  } else {
    // turn on / resume
    playerActive = true;
    if (!bgm.src || bgm.ended) {
      playNextSong();
    } else {
      const p = bgm.play();
      if (p && p.catch) p.catch(() => {});
    }
  }
  setTimeout(updateMusicButton, 50);
});

init();
showIntro();
updateMusicButton();
console.log("Anniversary page ready ❤️");
