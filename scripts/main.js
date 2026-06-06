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
const hint = document.getElementById("hint");

let current = null; // the pop-up sitting in the center, waiting to be thrown

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
  el.className = "popup";

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

// --- Throw + reveal ----------------------------------------------------------

// Move a pop-up from the center to a random scattered spot with a slight tilt.
function throwToTable(el) {
  // keep a margin so bubbles don't get clipped at the edges
  const x = rand(12, 88); // % of viewport width
  const y = rand(14, 86); // % of viewport height
  const tilt = rand(-14, 14);
  el.style.left = x + "%";
  el.style.top = y + "%";
  el.style.setProperty("--tilt", tilt + "deg");
}

function revealNew() {
  const el = buildPopup();
  el.classList.add("entering", "current");
  table.appendChild(el);
  // remove the entrance class once it's done so the throw transition is clean
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
  if (current) {
    current.classList.remove("current"); // demote: stop glow/breathing
    current.classList.add("thrown");
    throwToTable(current);
  }
  revealNew();
}

table.addEventListener("click", handleTap);

console.log("Anniversary page ready ❤️");
