// robot.js — Firebase realtime direction sender
import { db } from "./firebase";
import { ref, set } from "firebase/database";

const MOVE_TIME = 500; // ms before auto-stop

function saveDirection(char) {
  set(ref(db, "robot/liveDirection"), {
    direction: char,
    timestamp: Date.now(),
  });
}

export function move(dir) {
  const map = {
    forward:  "F",
    backward: "B",
    left:     "L",
    right:    "R",
    stop:     "S",
  };

  const char = map[dir] ?? "S";
  saveDirection(char);

  // Auto stop after MOVE_TIME unless it's an explicit stop command
  if (dir !== "stop") {
    setTimeout(() => saveDirection("S"), MOVE_TIME);
  }
}