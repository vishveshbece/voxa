import { db } from "./firebase";
import { ref, set } from "firebase/database";

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
}