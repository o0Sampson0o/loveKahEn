// Anniversary page.
//
// Behaviour: each tap throws the CURRENT centered pop-up onto the "table"
// (random spot + slight tilt, where it stays scattered) and reveals a new
// random pop-up in the center. A pop-up is either a chat-message bubble
// (mixed sent/received) or an image.
//
// Content below is placeholder lorem ipsum — replace MESSAGES (and add IMAGES)
// with the real ones later.

"use strict";

// --- Placeholder content -----------------------------------------------------

// Each message: { text, from: "me" | "her" }  -> styled as sent / received.
const MESSAGES = [
  { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", from: "me" },
  { text: "Sed do eiusmod tempor incididunt ut labore et dolore magna.", from: "her" },
  { text: "Ut enim ad minim veniam, quis nostrud exercitation.", from: "me" },
  { text: "Duis aute irure dolor in reprehenderit in voluptate velit.", from: "her" },
  { text: "Excepteur sint occaecat cupidatat non proident.", from: "me" },
  { text: "Quis nostrud exercitation ullamco laboris nisi ut aliquip.", from: "her" },
];

// Each image: { src, title?, date?, description? }  -> rendered as a polaroid.
// title / date / description are all optional; missing ones are simply omitted.
// Replace the picsum placeholders with "assets/images/your-photo.jpg" later.
const IMAGES = [
  {
    src: "https://picsum.photos/seed/lovekahen1/600/600",
    title: "Lorem Title",
    date: "Jan 2024",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
  },
  {
    src: "https://picsum.photos/seed/lovekahen2/600/600",
    title: "Dolor Sit",
    date: "Mar 2024",
  },
  {
    src: "https://picsum.photos/seed/lovekahen3/600/600",
    description: "Sed do eiusmod tempor incididunt ut labore.",
  },
  {
    src: "https://picsum.photos/seed/lovekahen4/600/600",
    date: "Jul 2024",
  },
  {
    // bare photo, no caption at all
    src: "https://picsum.photos/seed/lovekahen5/600/600",
  },
];

// --- Setup -------------------------------------------------------------------

const table = document.getElementById("table");   // scroll container
const surface = document.getElementById("surface"); // the canvas pop-ups live on
const hint = document.getElementById("hint");
const tossHint = document.getElementById("toss-hint");

let current = null;   // the live pop-up floating in the centre, waiting to be thrown
let surfaceW = 0;     // size of the scrollable canvas (set in init)
let surfaceH = 0;

const DENSITY = 5;    // max pop-ups per screen-sized area before it's "crowded"
const MARGIN = 90;    // keep thrown items this far from an area's edges (px)

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Building pop-ups --------------------------------------------------------

function buildMessage() {
  const msg = randomItem(MESSAGES);
  const el = document.createElement("div");
  el.className = "popup";
  const bubble = document.createElement("div");
  bubble.className = "bubble " + (msg.from === "me" ? "sent" : "recv");
  bubble.textContent = msg.text;
  el.appendChild(bubble);
  return el;
}

function buildImage() {
  const data = randomItem(IMAGES);

  const el = document.createElement("div");
  el.className = "popup is-image";

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

function countInRect(items, x0, y0, w, h) {
  return items.filter((el) => {
    const c = centerOf(el);
    return c.x >= x0 && c.x <= x0 + w && c.y >= y0 && c.y <= y0 + h;
  }).length;
}

// Pick a point inside a rectangle, biased towards open space (away from items).
function spotInRect(items, x0, y0, w, h) {
  let best = null;
  let bestDist = -1;
  for (let i = 0; i < 16; i++) {
    const x = rand(x0 + MARGIN, x0 + w - MARGIN);
    const y = rand(y0 + MARGIN, y0 + h - MARGIN);
    let nearest = Infinity;
    for (const el of items) {
      const c = centerOf(el);
      nearest = Math.min(nearest, Math.hypot(c.x - x, c.y - y));
    }
    if (nearest > bestDist) {
      bestDist = nearest;
      best = { x, y };
    }
    if (nearest > 150) break; // comfortably empty — good enough
  }
  return best;
}

// Decide where a thrown pop-up should land. If the current screen-area already
// holds DENSITY items, look to a neighbouring area and report the direction.
function chooseSpot() {
  const x0 = table.scrollLeft;
  const y0 = table.scrollTop;
  const w = table.clientWidth;
  const h = table.clientHeight;
  const items = thrownItems();

  if (countInRect(items, x0, y0, w, h) < DENSITY) {
    return { ...spotInRect(items, x0, y0, w, h), direction: null };
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
    if (countInRect(items, nx, ny, w, h) < DENSITY) {
      return { ...spotInRect(items, nx, ny, w, h), direction: n.direction };
    }
  }

  // Everything nearby is full — just drop it somewhere in view.
  return { ...spotInRect(items, x0, y0, w, h), direction: null };
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

  el.classList.remove("current"); // becomes absolute on the surface
  el.style.left = fromX + "px";
  el.style.top = fromY + "px";
  void el.offsetWidth; // commit that starting point so the move animates

  const dest = chooseSpot();
  el.classList.add("thrown");
  el.style.setProperty("--tilt", rand(-14, 14) + "deg");
  el.style.left = dest.x + "px";
  el.style.top = dest.y + "px";

  if (dest.direction) showTossHint(dest.direction);
}

function revealNew() {
  const el = buildPopup();
  el.classList.add("entering", "current"); // floats fixed in the screen centre
  surface.appendChild(el);
  el.addEventListener(
    "animationend",
    () => el.classList.remove("entering"),
    { once: true }
  );
  current = el;
}

function handleTap() {
  if (hint && !hint.classList.contains("hidden")) {
    hint.classList.add("hidden");
  }
  if (current) throwCurrent();
  revealNew();
}

table.addEventListener("click", handleTap);

init();
console.log("Anniversary page ready ❤️");
