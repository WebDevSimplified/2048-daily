import wait from "./wait"
import { animateElement } from "./animation"
import Tile from "./Tile"

const gameBoard = document.getElementById("main-game")
export async function startTest(grid, scoreElement) {
  await wait(250)
  await move(grid, scoreElement, "U")
  await move(grid, scoreElement, "R")
  await move(grid, scoreElement, "D")
  await move(grid, scoreElement, "R")
  await move(grid, scoreElement, "D")
  await move(grid, scoreElement, "R")
  await move(grid, scoreElement, "U")
  await move(grid, scoreElement, "D")
  await move(grid, scoreElement, "U")
  await move(grid, scoreElement, "D")
}

async function move(grid, scoreElement, direction, duration = 5) {
  switch (direction) {
    case "U":
      await grid.moveTilesUp()
      break
    case "D":
      await grid.moveTilesDown()
      break
    case "L":
      await grid.moveTilesLeft()
      break
    case "R":
      await grid.moveTilesRight()
      break
  }

  animateElement(scoreElement, "pop")
  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile
  if (duration > 0) await wait(duration)
}
