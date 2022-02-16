import { NUMBER_FORMATTER, TIME_FORMATTER } from "./formatters"
import gameManager from "./gameManager"
import Modal from "./Modal"
import Grid from "./Grid"
import Tile from "./Tile"
import wait from "./wait"
import {
  startOfTomorrow,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns"
import { animateElement } from "./animation"

const RELEASE_DATE = new Date(2022, 1, 11)

export default function setupModals(inputHandler) {
  const helpBtn = document.querySelector("[data-help-btn]")
  const statsBtn = document.querySelector("[data-stats-btn]")

  const helpModal = new Modal(
    document.querySelector("[data-help-modal-template]"),
    {
      onOpen: modal => {
        inputHandler.stopInput()
        setupInstructionGrid(modal)
      },
      onClose: () => {
        gameManager.userSettings.showIntro = false
        inputHandler.setupInput()
      },
    }
  )

  const statsModal = new Modal(
    document.querySelector("[data-stats-modal-template]"),
    {
      onOpen: modal => {
        inputHandler.stopInput()
        populateStatsModal(modal)
      },
      onClose: () => inputHandler.setupInput(),
    }
  )

  helpBtn.addEventListener("click", () => {
    helpModal.show()
  })

  statsBtn.addEventListener("click", () => {
    statsModal.show()
  })

  return { helpModal, statsModal }
}

async function setupInstructionGrid(modal) {
  const populateCell = (x, y, value) => {
    const cell = instructionGrid.cellsByRow[x][y]
    cell.tile = new Tile(instructionBoard, value)
  }

  const pressKey = direction => {
    arrowKeys.dataset.key = direction
    animateElement(arrowKeys, "press")
    switch (direction) {
      case "left":
        return instructionGrid.moveTilesLeft()
      case "right":
        return instructionGrid.moveTilesRight()
      case "up":
        return instructionGrid.moveTilesUp()
      case "down":
        return instructionGrid.moveTilesDown()
    }
  }

  const performAction = async (x, y, value, direction) => {
    await pressKey(direction)
    instructionGrid.cells.forEach(cell => cell.mergeTiles())
    populateCell(x, y, value)
    await wait()
  }

  const instructionBoard = modal.querySelector("#instruction-board")
  const arrowKeys = modal.querySelector("[data-arrow-keys]")
  const instructionGrid = new Grid(instructionBoard, {
    gridSize: 3,
    cellSize: 7.5,
    cellGap: 0.75,
  })

  delete arrowKeys.dataset.key
  arrowKeys.classList.remove("press")
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
  setupInstructionGrid(modal)
}

function populateStatsModal(modal) {
  const setValue = (selector, value, best = false) => {
    const elem = modal.querySelector(`[data-${selector}]`)
    elem.textContent = value
    elem.closest("[data-stat-container]").classList.toggle("best", best)
  }

  setupShareButton(modal)
  setupNextGameTimer(modal)

  const games = gameManager.stats.games
  const allTimeHighestTile = Math.max(...games.map(game => game.highestTile), 0)
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
    gameManager.currentGame.highestTile,
    gameManager.currentGame.highestTile >= allTimeHighestTile
  )

  setValue("high-score", NUMBER_FORMATTER.format(gameManager.stats.highScore))
  setValue("max-streak", gameManager.stats.maxStreak)
  setValue("highest-tile", allTimeHighestTile)
}

function setupShareButton(modal) {
  const shareBtn = modal.querySelector("[data-share-btn]")

  let hideMessageTimeout
  shareBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(getShareMessage())
    shareBtn.classList.add("show-message")
    if (hideMessageTimeout != null) clearTimeout(hideMessageTimeout)
    hideMessageTimeout = setTimeout(() => {
      shareBtn.classList.remove("show-message")
    }, 3000)
  })
}

function getShareMessage() {
  const currentGameDate = new Date(gameManager.currentGame.date)
  const gameNumber = differenceInDays(currentGameDate, RELEASE_DATE) + 1
  const largestTile = gameManager.currentGame.highestTile
  return `2048 Daily #${gameNumber}:
Score: ${numberToEmojis(gameManager.currentGame.score)}
Largest Tile: ${numberToEmojis(largestTile)}
Try to beat me: ${window.location}
#2048Daily`
}

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

function setupNextGameTimer(modal) {
  const interval = setInterval(() => {
    const nextGameTime = modal.querySelector("[data-next-game-time]")
    if (nextGameTime == null) return clearInterval(interval)
    renderNextGameTimer(nextGameTime)
  }, 1000)
  renderNextGameTimer(modal.querySelector("[data-next-game-time]"))
}

function renderNextGameTimer(nextGameTime) {
  const tomorrow = startOfTomorrow()
  const now = new Date()
  const hours = TIME_FORMATTER.format(differenceInHours(tomorrow, now))
  const minutes = TIME_FORMATTER.format(differenceInMinutes(tomorrow, now) % 60)
  const seconds = TIME_FORMATTER.format(differenceInSeconds(tomorrow, now) % 60)
  nextGameTime.textContent = `${hours}:${minutes}:${seconds}`
}
