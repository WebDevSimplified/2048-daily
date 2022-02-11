import Grid from "./Grid.js"
import Tile from "./Tile.js"
import InputHandler from "./InputHandler"
import gameManager from "./gameManager.js"
import {
  isToday,
  isYesterday,
  startOfTomorrow,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns"
import Modal from "./Modal.js"

const WINNING_TILE_VALUE = 2048
const RELEASE_DATE = new Date(2022, 1, 11)

const shareBtn = document.querySelector("[data-share-btn]")
const nextGameTime = document.querySelector("[data-next-game-time]")
const gameBoard = document.getElementById("main-game")
const instructionBoard = document.getElementById("instruction-board")
const arrowKeys = document.querySelector("[data-arrow-keys]")
const scoreElem = document.querySelector("[data-score]")
const scoreAmountElem = document.querySelector("[data-score-amount]")
const helpBtn = document.querySelector("[data-help-btn]")
const statsBtn = document.querySelector("[data-stats-btn]")
const NUMBER_FORMATTER = new Intl.NumberFormat(undefined)
const TIME_FORMATTER = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
})

setInterval(() => {
  const tomorrow = startOfTomorrow()
  const now = new Date()
  const hours = TIME_FORMATTER.format(differenceInHours(tomorrow, now))
  const minutes = TIME_FORMATTER.format(differenceInMinutes(tomorrow, now) % 60)
  const seconds = TIME_FORMATTER.format(differenceInSeconds(tomorrow, now) % 60)
  nextGameTime.textContent = `${hours}:${minutes}:${seconds}`
}, 1000)

const grid = new Grid(gameBoard)
const helpModal = new Modal(document.querySelector("[data-help-modal]"), {
  onClose: () => {
    gameManager.userSettings.showIntro = false
  },
})
const statsModal = new Modal(document.querySelector("[data-stats-modal]"), {
  onOpen: populateStatsModal,
})
const instructionGrid = new Grid(instructionBoard, {
  gridSize: 3,
  cellSize: 7.5,
  cellGap: 0.75,
})
setupInstructionGrid(instructionGrid)
helpBtn.addEventListener("click", () => {
  helpModal.show()
})

statsBtn.addEventListener("click", () => {
  statsModal.show()
})

if (gameManager.userSettings.showIntro) {
  helpModal.show()
}

if (
  gameManager.currentGame.tiles.length > 0 &&
  isToday(new Date(gameManager.currentGame.date))
) {
  gameManager.currentGame.tiles.forEach(t => {
    const tile = new Tile(gameBoard, t.value)
    grid.cellsByColumn[t.x][t.y].tile = tile
  })
} else {
  gameManager.currentGame.date = new Date()
  grid.randomEmptyCell().tile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = new Tile(gameBoard)
  saveCurrentState()
}
new InputHandler(handleInput)
showScore()
if (!canMoveDown() && !canMoveUp() && !canMoveLeft() && !canMoveRight()) {
  setTimeout(gameOverDanceModal, 500)
}

let hideMessageTimeout
shareBtn.addEventListener("click", async () => {
  const gameNumber =
    differenceInDays(RELEASE_DATE, new Date(gameManager.currentGame.date)) + 1
  const largestTile =
    gameManager.stats.games[gameManager.stats.games.length - 1].highestTile
  const shareMessage = `2048 Daily #${gameNumber}:
Score: ${numberToEmojis(gameManager.currentGame.score)}
Largest Tile: ${numberToEmojis(largestTile)}
Try to beat me: ${window.location}
#2048Daily`
  await navigator.clipboard.writeText(shareMessage)
  shareBtn.classList.add("show-message")
  if (hideMessageTimeout != null) clearTimeout(hideMessageTimeout)
  hideMessageTimeout = setTimeout(() => {
    shareBtn.classList.remove("show-message")
  }, 3000)
})

function numberToEmojis(number) {
  return number
    .toString()
    .replace(/0/g, "0️⃣")
    .replace(/1/g, "1️⃣")
    .replace(/2/g, "2️⃣")
    .replace(/3/g, "3️⃣")
    .replace(/4/g, "4️⃣")
    .replace(/5/g, "5️⃣")
    .replace(/6/g, "6️⃣")
    .replace(/7/g, "7️⃣")
    .replace(/8/g, "8️⃣")
    .replace(/9/g, "9️⃣")
}

async function handleInput(direction) {
  switch (direction) {
    case "ArrowUp":
      if (!canMoveUp()) return true
      await moveUp()
      break
    case "ArrowDown":
      if (!canMoveDown()) return true
      await moveDown()
      break
    case "ArrowLeft":
      if (!canMoveLeft()) return true
      await moveLeft()
      break
    case "ArrowRight":
      if (!canMoveRight()) return true
      await moveRight()
      break
    default:
      return true
  }

  const additionalScore = grid.cells.reduce(
    (sum, cell) => sum + cell.mergeTiles(),
    0
  )
  if (additionalScore > 0) {
    gameManager.currentGame.score += additionalScore
    showScore(additionalScore)
  }

  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(handleGameOver)
  }
  saveCurrentState()
  return true
}

function moveUp(selectedGrid = grid) {
  return slideTiles(selectedGrid.cellsByColumn)
}

function moveDown(selectedGrid = grid) {
  return slideTiles(
    selectedGrid.cellsByColumn.map(column => [...column].reverse())
  )
}

function moveLeft(selectedGrid = grid) {
  return slideTiles(selectedGrid.cellsByRow)
}

function moveRight(selectedGrid = grid) {
  return slideTiles(selectedGrid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(group => {
      const promises = []
      for (let i = 1; i < group.length; i++) {
        const cell = group[i]
        if (cell.tile == null) continue
        let lastValidCell
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j]
          if (!moveToCell.canAccept(cell.tile)) break
          lastValidCell = moveToCell
        }
        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition())
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile
          } else {
            lastValidCell.tile = cell.tile
          }
          cell.tile = null
        }
      }
      return promises
    })
  )
}

function canMoveUp() {
  return canMove(grid.cellsByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsByRow)
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false
      if (cell.tile == null) return false
      const moveToCell = group[index - 1]
      return moveToCell.canAccept(cell.tile)
    })
  })
}

function saveCurrentState() {
  gameManager.currentGame.tiles = grid.cells
    .filter(cell => cell.tile != null)
    .map(cell => {
      return { x: cell.x, y: cell.y, value: cell.tile.value }
    })
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
    additionalScoreElem.addEventListener("animationend", () => {
      additionalScoreElem.remove()
    })
    scoreElem.appendChild(additionalScoreElem)
  }
  scoreAmountElem.textContent = NUMBER_FORMATTER.format(
    gameManager.currentGame.score
  )
  // TODO: Fix bug
  scoreAmountElem.classList.add("pop")
  scoreAmountElem.addEventListener(
    "transitionend",
    e => {
      console.log(e)
      scoreAmountElem.classList.remove("pop")
    },
    { once: true }
  )
}

function handleGameOver() {
  const highestTile = Math.max(...grid.cells.map(cell => cell.tile.value))
  gameManager.stats.games.push({
    score: gameManager.currentGame.score,
    highestTile,
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

async function setupInstructionGrid(instructionGrid) {
  const populateCell = (x, y, value) => {
    const cell = instructionGrid.cellsByRow[x][y]
    cell.tile = new Tile(instructionBoard, value)
  }

  const pressKey = direction => {
    arrowKeys.dataset.key = direction
    arrowKeys.classList.add("press")
    arrowKeys.addEventListener(
      "transitionend",
      () => {
        arrowKeys.classList.remove("press")
      },
      { once: true }
    )
    switch (direction) {
      case "left":
        return moveLeft(instructionGrid)
      case "right":
        return moveRight(instructionGrid)
      case "up":
        return moveUp(instructionGrid)
      case "down":
        return moveDown(instructionGrid)
    }
  }

  const performAction = async (x, y, value, direction) => {
    await pressKey(direction)
    instructionGrid.cells.forEach(cell => cell.mergeTiles())
    populateCell(x, y, value)
    await wait()
  }

  instructionGrid.cells.forEach(cell => {
    if (cell.tile == null) return
    cell.tile.remove()
    cell.tile = undefined
  })
  delete arrowKeys.dataset.key
  populateCell(1, 1, 2)
  await wait()
  await performAction(0, 2, 2, "left")
  await performAction(0, 1, 2, "down")
  await performAction(1, 0, 4, "right")
  await performAction(0, 0, 4, "down")
  await performAction(1, 0, 2, "right")
  await performAction(2, 1, 2, "right")
  await performAction(0, 0, 4, "down")
  await performAction(0, 1, 2, "down")
  await wait()
  setupInstructionGrid(instructionGrid)
}

function wait(duration = 1000) {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}

function populateStatsModal() {
  const setValue = (selector, value, best = false) => {
    const elem = statsModal.modalContainer.querySelector(`[data-${selector}]`)
    elem.textContent = value
    elem.closest("[data-stat-container]").classList.toggle("best", best)
  }

  const allTimeHighestTile = Math.max(
    ...gameManager.stats.games.map(game => game.highestTile)
  )
  const currentHighestTile =
    gameManager.stats.games[gameManager.stats.games.length - 1].highestTile
  setValue(
    "current-game-score",
    NUMBER_FORMATTER.format(gameManager.currentGame.score),
    gameManager.currentGame.score >= gameManager.stats.highScore
  )
  setValue(
    "current-streak",
    gameManager.stats.currentStreak,
    gameManager.stats.currentStreak >= gameManager.stats.maxStreak
  )
  setValue(
    "current-game-highest-tile",
    currentHighestTile,
    currentHighestTile >= allTimeHighestTile
  )

  setValue("high-score", NUMBER_FORMATTER.format(gameManager.stats.highScore))
  setValue("max-streak", gameManager.stats.maxStreak)
  setValue(
    "highest-tile",
    Math.max(...gameManager.stats.games.map(game => game.highestTile))
  )
}
