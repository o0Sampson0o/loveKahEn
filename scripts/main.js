// Anniversary page — scaffold.
// Behaviour (built step by step): each tap throws the current pop-up onto the
// "table" and reveals a new random one (a message or an image).
//
// For now this is just the wiring + placeholder content so we can verify the
// project runs. We'll flesh out the pop-up look & feel in the next steps.

"use strict";

// --- Placeholder content (replace with real messages / images later) ---
const MESSAGES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
];

// const IMAGES = ["assets/images/1.jpg", "assets/images/2.jpg"]; // added later

const table = document.getElementById("table");
const hint = document.getElementById("hint");

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Temporary minimal pop-up so we can see clicks working.
// (Real messaging-app styling + "throw to table" comes in the next step.)
function showPopup() {
  const el = document.createElement("div");
  el.textContent = randomItem(MESSAGES);
  el.style.position = "absolute";
  el.style.left = "50%";
  el.style.top = "50%";
  el.style.transform = "translate(-50%, -50%)";
  el.style.maxWidth = "80%";
  el.style.padding = "12px 16px";
  el.style.background = "#fff";
  el.style.borderRadius = "16px";
  el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
  table.appendChild(el);
}

function handleTap() {
  if (hint && !hint.classList.contains("hidden")) {
    hint.classList.add("hidden");
  }
  showPopup();
}

table.addEventListener("click", handleTap);

console.log("Anniversary page ready ❤️");
