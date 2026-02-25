import { move } from "./robot";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let micOn = false;
let onStatusChange = null;

export function onVoiceStatus(cb) {
  onStatusChange = cb;
}

function emit(text) {
  if (onStatusChange) onStatusChange(text);
}

function parseCommand(transcript) {
  const t = transcript.toLowerCase().trim();
  if (t.includes("auto stop") || t.includes("stop auto")) return "auto_stop";
  if (t.includes("auto"))                                  return "auto";
  if (t.includes("stop") || t.includes("halt"))           return "stop";
  if (t.includes("forward") || t.includes("ahead"))       return "forward";
  if (t.includes("back") || t.includes("reverse"))        return "backward";
  if (t.includes("left"))                                  return "left";
  if (t.includes("right"))                                 return "right";
  return null;
}

export function toggleMic({ onAutoStart, onAutoStop } = {}) {
  if (!SR) {
    alert("Speech Recognition is not supported in this browser.");
    return false;
  }

  if (!recognition) {
    recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const raw = e.results[e.results.length - 1][0].transcript;
      const cmd = parseCommand(raw);
      console.log("[Voice] heard:", raw, "→ cmd:", cmd);

      switch (cmd) {
        case "forward":
          move("forward");
          emit("📡 Moving Forward");
          break;
        case "backward":
          move("backward");
          emit("📡 Moving Backward");
          break;
        case "left":
          move("left");
          emit("📡 Turning Left");
          break;
        case "right":
          move("right");
          emit("📡 Turning Right");
          break;
        case "stop":
          move("stop");
          emit("🛑 Stopped");
          break;
        case "auto":
          if (onAutoStart) onAutoStart();
          emit("🔄 Auto Mode Activated");
          break;
        case "auto_stop":
          move("stop");
          if (onAutoStop) onAutoStop();
          emit("🛑 Auto Stopped");
          break;
        default:
          emit(`❓ Not understood: "${raw}"`);
      }
    };

    recognition.onerror = (e) => {
      console.warn("[Voice] error:", e.error);
      if (e.error === "not-allowed") {
        emit("🚫 Mic permission denied");
        micOn = false;
      }
    };

    recognition.onend = () => {
      if (micOn) {
        try { recognition.start(); } catch (_) {}
      }
    };
  }

  micOn = !micOn;

  if (micOn) {
    try {
      recognition.start();
      emit("🎤 Listening…");
    } catch (e) {
      console.warn("[Voice] start error:", e);
    }
  } else {
    recognition.stop();
    emit("🔇 Mic Off");
  }

  return micOn;
}

export function isMicActive() {
  return micOn;
}