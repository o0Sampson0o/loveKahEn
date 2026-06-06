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

const table = document.getElementById("table");
const world = document.getElementById("world"); // pannable surface (the camera)
const hint = document.getElementById("hint");

let current = null;   // the pop-up sitting in the center, waiting to be thrown
let placeIndex = 0;   // which slot the next pop-up lands in (serpentine layout)
let camX = 0;         // current camera translation
let camY = 0;

const COLS = 4;       // pop-ups laid out in rows of this many before wrapping

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

// --- Camera (panning the world) ----------------------------------------------

function viewport() {
  return { w: window.innerWidth, h: window.innerHeight };
}

// Size of one layout slot, relative to the screen.
function cellSize() {
  const { w, h } = viewport();
  return { w: Math.min(w * 0.62, 320), h: Math.min(h * 0.5, 320) };
}

// World position (slot center) for the Nth pop-up, walking left-to-right then
// snaking back on the next row so the pile spreads across the table.
function slotForIndex(i) {
  const c = cellSize();
  const row = Math.floor(i / COLS);
  const inRow = i % COLS;
  const col = row % 2 === 0 ? inRow : COLS - 1 - inRow; // serpentine
  return { x: col * c.w + c.w / 2, y: row * c.h + c.h / 2 };
}

function applyCamera(x, y, animate) {
  camX = x;
  camY = y;
  world.classList.toggle("dragging", !animate); // .dragging disables the transition
  world.style.transform = `translate(${camX}px, ${camY}px)`;
}

// Pan so that a given world point sits in the middle of the screen.
function centerOn(x, y, animate = true) {
  const { w, h } = viewport();
  applyCamera(w / 2 - x, h / 2 - y, animate);
}

// --- Throw + reveal ----------------------------------------------------------

function placeAt(el, x, y) {
  el.style.left = x + "px";
  el.style.top = y + "px";
}

// Demote the current pop-up: it stays where it is, tilts, and nudges a touch
// for an organic "tossed on the table" feel.
function throwCurrent() {
  const el = current;
  el.classList.remove("current"); // stop glow/breathing
  el.classList.add("thrown");
  el.style.setProperty("--tilt", rand(-14, 14) + "deg");
  placeAt(el, parseFloat(el.style.left) + rand(-28, 28),
              parseFloat(el.style.top) + rand(-22, 22));
}

function revealNew() {
  const el = buildPopup();
  const slot = slotForIndex(placeIndex);
  placeAt(el, slot.x, slot.y);
  el.classList.add("entering", "current");
  world.appendChild(el);
  el.addEventListener(
    "animationend",
    () => el.classList.remove("entering"),
    { once: true }
  );
  current = el;
  centerOn(slot.x, slot.y, true); // glide the table over to the fresh spot
}

function handleTap() {
  if (hint && !hint.classList.contains("hidden")) {
    hint.classList.add("hidden");
  }
  if (current) {
    throwCurrent();
    placeIndex++;
  }
  revealNew();
}

// --- Input: tap to throw, drag to pan the table ------------------------------

let pointerDown = false;
let dragging = false;
let startX = 0;
let startY = 0;
let camStartX = 0;
let camStartY = 0;
const DRAG_THRESHOLD = 8; // px of movement before a press becomes a drag

table.addEventListener("pointerdown", (e) => {
  pointerDown = true;
  dragging = false;
  startX = e.clientX;
  startY = e.clientY;
  camStartX = camX;
  camStartY = camY;
});

table.addEventListener("pointermove", (e) => {
  if (!pointerDown) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) dragging = true;
  if (dragging) applyCamera(camStartX + dx, camStartY + dy, false);
});

function endPointer() {
  if (!pointerDown) return;
  pointerDown = false;
  if (dragging) {
    world.classList.remove("dragging"); // re-enable smooth panning next time
  } else {
    handleTap(); // a clean press (no drag) throws + reveals
  }
}

table.addEventListener("pointerup", endPointer);
table.addEventListener("pointercancel", endPointer);

// Keep the live pop-up centered if the screen is resized / rotated.
window.addEventListener("resize", () => {
  if (current) {
    centerOn(parseFloat(current.style.left), parseFloat(current.style.top), false);
  }
});

console.log("Anniversary page ready ❤️");
