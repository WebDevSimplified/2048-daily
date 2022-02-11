import defaultsDeep from "lodash/fp/defaultsDeep"
import DeepProxy from "proxy-deep"
import seededRandom from "./seededRandom"

const defaultGameState = {
  userSettings: {
    showIntro: true,
  },
  stats: {
    highScore: 0,
    games: [],
    currentStreak: 0,
    maxStreak: 0,
  },
  currentGame: { score: 0, tiles: [], date: new Date() },
}
const gameState = defaultsDeep(
  defaultGameState,
  JSON.parse(localStorage.getItem("gameState")) || {}
)

const proxy = new DeepProxy(gameState, {
  get() {
    const result = Reflect.get(...arguments)
    if (
      typeof result === "object" &&
      result !== null &&
      !(result instanceof Date)
    ) {
      return this.nest(result)
    }
    return result
  },
  set() {
    const result = Reflect.set(...arguments)
    gameState.currentGame.seedState = seededRandom.state()
    localStorage.setItem("gameState", JSON.stringify(gameState))
    return result
  },
  apply() {
    const result = Reflect.apply(...arguments)
    gameState.currentGame.seedState = seededRandom.state()
    localStorage.setItem("gameState", JSON.stringify(gameState))
    return result
  },
})

export default proxy
