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

// Image paths, e.g. "assets/images/1.jpg". Empty for now — add later.
const IMAGES = [];

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
  const el = document.createElement("div");
  el.className = "popup";
  const img = document.createElement("img");
  img.className = "photo";
  img.src = randomItem(IMAGES);
  img.alt = "";
  el.appendChild(img);
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
