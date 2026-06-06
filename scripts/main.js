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
  {
    text: "晚安",
    from: "her",
  },
  {
    text: "晚安",
    from: "me",
  },
  {
    text: "笨笨蛋😡",
    from: "her",
  },
  {
    text: "你才傻傻猪",
    from: "me",
  },
  {
    text: "早安",
    from: "me",
  },
  {
    text: "傻猪",
    from: "her",
  },
  {
    text: "晚安 傻猪",
    from: "me",
  },
  {
    text: "那22可以跟你約會嗎學長",
    from: "her",
  },
  {
    text: "我不管了！！！！！\n你的男媽媽上線了！！！！\n我還是無法冷靜！\n記得 檢查護照 錢包 水壺 衣服 行李 隨身包 補給 如果能就 online check in！！！\n\n然後 祝你一路順風👍👍\n\n然後有事記得說！至少我知道一下！知道嗎？好知道了。乖😋",
    from: "me",
  },
];

// Each image: { src, title?, date?, description? }  -> rendered as a polaroid.
// title / date / description are all optional; missing ones are simply omitted.
// Replace the picsum placeholders with "assets/images/your-photo.jpg" later.
const IMAGES = [
  {
    src: "assets/images/theatre.jpg",
    title: "第一次一起看电影（avatar3）",
    date: "06/02/2026",
  },
  {
    src: "assets/images/shopping.jpg",
    title: "一起牵手逛街",
    date: "30/01/2026",
  },
  {
    src: "assets/images/meusum.jpg",
    title: "一起逛博物馆",
    date: "22/02/2026",
  },
  {
    src: "assets/images/birthday.jpg",
    title: "为对方庆生日",
    date: "28/02/2026",
  },
  {
    src: "assets/images/ugly.jpg",
    title: "一起拍丑照",
    date: "17/01/2026",
  },
  {
    src: "assets/images/movie.jpg",
    title: "一起追剧",
    date: "09/02/2026",
  },
  {
    src: "assets/images/2playergame.jpg",
    title: "一起玩双人游戏",
    date: "25/12/2025",
  },
  {
    src: "assets/images/icecream.jpg",
    title: "一起吃雪糕",
    date: "12/12/2026",
  },
  {
    src: "assets/images/couple.jpg",
    title: "一起拍情侣照",
    date: "19/01/2026",
  },
  {
    src: "assets/images/valentine.jpg",
    title: "一起过情人节",
    date: "30/01/2026",
  },
  {
    src: "assets/images/boardgame.jpg",
    title: "一起玩桌游",
    date: "25/12/2025",
  },
  {
    src: "assets/images/showoff.jpg",
    title: "发朋友圈秀恩爱",
    date: "30/01/2026",
  },
  {
    src: "assets/images/mlsfirstdate.jpg",
    title: "mls first date",
    date: "30/01/2026",
  },
  {
    src: "assets/images/Xmasfirst.jpg",
    title: "Xmas first",
    date: "25/12/2025",
  },
  {
    src: "assets/images/confessagain.jpg",
    title: "再次表白喔",
    date: "17/01/2026",
  },
  {
    src: "assets/images/freezing.jpg",
    title: "冷死了",
    date: "09/01/2026",
  },
  {
    src: "assets/images/hug.jpg",
    title: "抱来抱去",
    date: "16/01/2026",
  },
  {
    src: "assets/images/cry.jpg",
    title: "哭哭猪",
    date: "28/12/2025",
  },
  {
    src: "assets/images/cat.jpg",
    title: "猫猫 再见微积分",
    date: "02/01/2026",
  },
  {
    src: "assets/images/wow.jpg",
    title: "wow手信",
    date: "12/01/2026",
  },
  {
    src: "assets/images/second.jpg",
    title: "一下飞机第二天就约会",
    date: "24/01/2026",
  },
  {
    src: "assets/images/classtogather.jpg",
    title: "一起上课哦",
    date: "18/12/2025",
  },
  {
    src: "assets/images/markettogather.jpg",
    title: "第一次一起逛夜市",
    date: "13/12/2025",
  },
  {
    src: "assets/images/shy.jpg",
    title: "娇羞哦",
    date: "12/02/2026",
  },
  {
    src: "assets/images/birthday2.jpg",
    title: "生日",
    date: "28/02/2026",
  },
];

// --- Setup -------------------------------------------------------------------

const table = document.getElementById("table"); // scroll container
const surface = document.getElementById("surface"); // the canvas pop-ups live on
const intro = document.getElementById("intro"); // opening splash
const tossHint = document.getElementById("toss-hint");

// The day you got together (year, month-1, day). Months are 0-indexed: 11 = Dec.
const START_DATE = new Date(2025, 11, 6); // 6 Dec 2025

let current = null; // the live pop-up floating in the centre, waiting to be thrown
let surfaceW = 0; // size of the scrollable canvas (set in init)
let surfaceH = 0;

const DENSITY = 5; // max pop-ups per screen-sized area before it's "crowded"
const MARGIN = 90; // keep thrown items this far from an area's edges (px)

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
  el.addEventListener("animationend", () => el.classList.remove("entering"), {
    once: true,
  });
  current = el;
}

function handleTap() {
  if (current) throwCurrent();
  revealNew();
}

table.addEventListener("click", handleTap);

// --- Opening splash: show the day count, tap to begin ------------------------

// Whole days from START_DATE to today. Both dates are normalised to midnight so
// the count is exact regardless of the time of day she opens it.
function daysTogether() {
  const start = new Date(
    START_DATE.getFullYear(),
    START_DATE.getMonth(),
    START_DATE.getDate()
  );
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today - start) / 86400000));
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
      revealNew();
    },
    { once: true }
  );
}

init();
showIntro();
console.log("Anniversary page ready ❤️");
