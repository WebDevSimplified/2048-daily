import Grid from "./Grid.js"
import Tile from "./Tile.js"
import InputHandler from "./InputHandler"
import gameManager from "./gameManager.js"
import { isToday, isYesterday } from "date-fns"
import wait from "./wait.js"
import setupModals from "./setupModals.js"
import { NUMBER_FORMATTER } from "./formatters.js"
import InvalidMoveError from "./InvalidMoveError"
import { animateElement, waitForAnimation } from "./animation.js"

const gameBoard = document.getElementById("main-game")
const scoreElem = document.querySelector("[data-score]")
const scoreAmountElem = document.querySelector("[data-score-amount]")
const inputHandler = new InputHandler(handleInput, gameBoard)
const { statsModal, helpModal } = setupModals(inputHandler)
const grid = new Grid(gameBoard)

if (
  gameManager.currentGame.tiles.length > 0 &&
  isToday(gameManager.currentGame.date)
) {
  gameManager.currentGame.tiles.forEach(t => {
    const tile = new Tile(gameBoard, t.value)
    grid.cellsByColumn[t.x][t.y].tile = tile
  })
} else {
  grid.randomEmptyCell().tile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = new Tile(gameBoard)
  saveCurrentState()
}
inputHandler.setupInput()
showScore()

if (gameManager.userSettings.showIntro) helpModal.show()
if (!grid.canMoveTilesAnyDirection()) setTimeout(gameOverDanceModal, 500)

async function handleInput(direction) {
  try {
    const additionalScore = await moveTiles(direction)

    if (additionalScore > 0) {
      gameManager.currentGame.score += additionalScore
      showScore(additionalScore)
    }
  } catch (e) {
    if (e instanceof InvalidMoveError) {
      if (grid.canMoveTilesAnyDirection()) inputHandler.setupInput()
      return
    }
    throw e
  }

  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile

  if (!grid.canMoveTilesAnyDirection()) {
    newTile.waitForTransition().then(handleGameOver)
  }
  saveCurrentState()
  if (grid.canMoveTilesAnyDirection()) inputHandler.setupInput()
}

function moveTiles(direction) {
  switch (direction) {
    case "ArrowUp":
    case "k":
    case "w":
      if (!grid.canMoveTilesUp()) throw new InvalidMoveError()
      return grid.moveTilesUp()
    case "ArrowDown":
    case "j":
    case "s":
      if (!grid.canMoveTilesDown()) throw new InvalidMoveError()
      return grid.moveTilesDown()
    case "ArrowLeft":
    case "h":
    case "a":
      if (!grid.canMoveTilesLeft()) throw new InvalidMoveError()
      return grid.moveTilesLeft()
    case "ArrowRight":
    case "l":
    case "d":
      if (!grid.canMoveTilesRight()) throw new InvalidMoveError()
      return grid.moveTilesRight()
    default:
      throw new InvalidMoveError()
  }
}

function saveCurrentState() {
  gameManager.currentGame.tiles = grid.cells
    .filter(cell => cell.tile != null)
    .map(cell => {
      return { x: cell.x, y: cell.y, value: cell.tile.value }
    })
  gameManager.currentGame.highestTile = Math.max(
    ...grid.cells.map(cell => cell.tile?.value || 0)
  )
}

function showScore(additionalScore) {
  if (additionalScore != null) {
    const additionalScoreElem = document.createElement("div")
    additionalScoreElem.classList.add("additional-score")
    additionalScoreElem.textContent = `+${additionalScore}`
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    additionalScoreElem.style.setProperty("--start-x", `${startX}%`)
    additionalScoreElem.style.setProperty("--start-y", `${startY}%`)
    additionalScoreElem.style.setProperty(
      "--end-x",
      `${startX + (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 50 + 50)}%`
    )
    additionalScoreElem.style.setProperty(
      "--end-y",
      `${startY + Math.random() * 50 + 50}%`
    )
    waitForAnimation(additionalScoreElem).then(() => {
      additionalScoreElem.remove()
    })
    scoreElem.appendChild(additionalScoreElem)
  }
  scoreAmountElem.textContent = NUMBER_FORMATTER.format(
    gameManager.currentGame.score
  )
  // TODO: Fix animation bugs
  animateElement(scoreAmountElem, "pop")
}

function handleGameOver() {
  gameManager.stats.games.push({
    score: gameManager.currentGame.score,
    highestTile: gameManager.currentGame.highestTile,
  })
  if (
    gameManager.stats.lastTimePlayed == null ||
    isYesterday(new Date(gameManager.stats.lastTimePlayed))
  ) {
    gameManager.stats.currentStreak += 1
  }
  if (gameManager.stats.highScore < gameManager.currentGame.score) {
    gameManager.stats.highScore = gameManager.currentGame.score
  }
  if (gameManager.stats.currentStreak > gameManager.stats.maxStreak) {
    gameManager.stats.maxStreak = gameManager.stats.currentStreak
  }
  gameManager.stats.lastTimePlayed = gameManager.currentGame.date

  gameOverDanceModal()
}

async function gameOverDanceModal() {
  await Promise.all(
    grid.cells.map(async cell => {
      await wait(50 * (cell.x + cell.y))
      if (cell.tile == null) console.log(cell)
      return cell.tile.pop()
    })
  )
  await wait(500)
  statsModal.show()
}
