// main.js — entry point
import { move } from "./robot";
import { toggleMic, onVoiceStatus, isMicActive } from "./voice";

/* ── DOM refs ── */
const chat    = document.getElementById("chat");
const micBtn  = document.getElementById("micBtn");
const modeBtn = document.getElementById("modeBtn");
const autoBtn = document.getElementById("autoBtn");
const dpad    = document.getElementById("dpad");
const robot   = document.getElementById("robot");
const arena   = document.getElementById("arena");

/* ── State ── */
let x = 0, y = 0;
let autoTimer = null;
let autoActive = false;

/* ── Chat / status display ── */
function setChat(text) {
  chat.textContent = text;
  // Text-to-speech
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[^\w\s]/g, ""));
  u.rate = 1.2;
  speechSynthesis.speak(u);
}

// Forward voice status updates to UI
onVoiceStatus((text) => {
  setChat(text);
  micBtn.classList.toggle("active", isMicActive());
});

/* ── UI robot movement (visual only) ── */
function moveUI(dir) {
  const step = 40;
  if (dir === "forward")  y -= step;
  if (dir === "backward") y += step;
  if (dir === "left")     x += step;   // display swap
  if (dir === "right")    x -= step;
  robot.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
}

/* ── D-pad buttons ── */
document.getElementById("forward") ?.addEventListener("click", () => { moveUI("forward");  move("forward");  setChat("📡 Moving Forward"); });
document.getElementById("backward")?.addEventListener("click", () => { moveUI("backward"); move("backward"); setChat("📡 Moving Backward"); });
document.getElementById("left")    ?.addEventListener("click", () => { moveUI("left");     move("left");     setChat("📡 Turning Left"); });
document.getElementById("right")   ?.addEventListener("click", () => { moveUI("right");    move("right");    setChat("📡 Turning Right"); });
document.getElementById("stop-btn")?.addEventListener("click", () => { stopAll(); });

/* ── Mic toggle ── */
micBtn.addEventListener("click", () => {
  toggleMic({
    onAutoStart: startAuto,
    onAutoStop:  stopAuto,
  });
});

/* ── Mode toggle (show/hide D-pad) ── */
modeBtn.addEventListener("click", () => {
  dpad.classList.toggle("hidden");
});

/* ── Auto mode ── */
autoBtn.addEventListener("click", () => {
  autoActive ? stopAuto() : startAuto();
});

function startAuto() {
  if (autoActive) return;
  autoActive = true;
  autoBtn.textContent = "⏹ STOP AUTO";
  setChat("🔄 Auto Mode On");

  const seq = ["forward", "left", "right", "backward"];
  let i = 0;

  autoTimer = setInterval(() => {
    const dir = seq[i++ % seq.length];
    moveUI(dir);
    move(dir);
  }, 1200);
}

function stopAuto() {
  if (!autoActive) return;
  autoActive = false;
  clearInterval(autoTimer);
  autoTimer = null;
  autoBtn.textContent = "▶ AUTO MODE";
  move("stop");
  setChat("🛑 Auto Stopped");
}

function stopAll() {
  stopAuto();
  move("stop");
  setChat("🛑 Stopped");
}

/* ── Touch drag (visual only) ── */
arena.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const rect  = arena.getBoundingClientRect();
  x = touch.clientX - rect.left  - rect.width  / 2;
  y = touch.clientY - rect.top   - rect.height / 2;
  robot.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
});