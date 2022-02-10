import seededRandom from "./seededRandom"

const DEFAULT_GRID_SIZE = 4
const DEFAULT_CELL_SIZE = 19
const DEFAULT_CELL_GAP = 2

export default class Grid {
  #cells

  constructor(
    gridElem,
    {
      gridSize = DEFAULT_GRID_SIZE,
      cellSize = DEFAULT_CELL_SIZE,
      cellGap = DEFAULT_CELL_GAP,
    } = {}
  ) {
    gridElem.style.setProperty("--grid-size", gridSize)
    gridElem.style.setProperty("--cell-size", `${cellSize}vmin`)
    gridElem.style.setProperty("--cell-gap", `${cellGap}vmin`)
    this.#cells = createCellElements(gridElem, gridSize).map((cell, index) => {
      return new Cell(cell, index % gridSize, Math.floor(index / gridSize))
    })
  }

  get cellsByColumn() {
    return this.cells.reduce((cellGrid, cell) => {
      cellGrid[cell.x] = cellGrid[cell.x] || []
      cellGrid[cell.x][cell.y] = cell
      return cellGrid
    }, [])
  }

  get cellsByRow() {
    return this.cells.reduce((cellGrid, cell) => {
      cellGrid[cell.y] = cellGrid[cell.y] || []
      cellGrid[cell.y][cell.x] = cell
      return cellGrid
    }, [])
  }

  get cells() {
    return this.#cells
  }

  get #emptyCells() {
    return this.cells.filter(cell => cell.tile == null)
  }

  randomEmptyCell() {
    const randomIndex = Math.floor(seededRandom() * this.#emptyCells.length)
    return this.#emptyCells[randomIndex]
  }
}

class Cell {
  #tile
  #mergeTile
  constructor(cell, x, y) {
    this.cell = cell
    this.x = x
    this.y = y
  }

  get tile() {
    return this.#tile
  }

  set tile(value) {
    this.#tile = value
    if (value == null) return
    this.#tile.x = this.x
    this.#tile.y = this.y
  }

  get mergeTile() {
    return this.#mergeTile
  }

  set mergeTile(value) {
    this.#mergeTile = value
    if (value == null) return
    this.#mergeTile.x = this.x
    this.#mergeTile.y = this.y
  }

  canAccept(tile) {
    return (
      this.tile == null ||
      (this.mergeTile == null && this.tile.value === tile.value)
    )
  }

  mergeTiles() {
    if (this.tile == null || this.mergeTile == null) return 0
    this.tile.value = this.tile.value + this.mergeTile.value
    this.mergeTile.remove()
    this.mergeTile = null
    this.tile.pop()
    return this.tile.value
  }
}

function createCellElements(gridElem, gridSize) {
  const cells = []
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div")
    cells.push(cell)
    cell.classList.add("cell")
    gridElem.append(cell)
  }
  return cells
}
