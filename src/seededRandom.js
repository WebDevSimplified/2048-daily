import gameManager from "./gameManager"
import seedrandom from "seedrandom"
import { startOfDay } from "date-fns"

let seededRandom
if (gameManager.currentGame.seedState == null) {
  seededRandom = seedrandom(startOfDay(new Date()), { state: true })
} else {
  seededRandom = seedrandom("", { state: gameManager.currentGame.seedState })
}

export default seededRandom
