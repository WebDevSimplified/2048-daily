const GRID_SIZE = 4
const CELL_SIZE = 20
const CELL_GAP = 2

export default class Grid {
  #cells

  constructor(gridElem) {
    gridElem.style.setProperty("--grid-size", GRID_SIZE)
    gridElem.style.setProperty("--cell-size", `${CELL_SIZE}vmin`)
    gridElem.style.setProperty("--cell-gap", `${CELL_GAP}vmin`)
    this.#cells = createCellElements(gridElem).map((cell, index) => {
      return new Cell(cell, index % GRID_SIZE, Math.floor(index / GRID_SIZE))
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
    const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)
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
    if (this.tile == null || this.mergeTile == null) return
    this.tile.value = this.tile.value + this.mergeTile.value
    this.mergeTile.remove()
    this.mergeTile = null
  }
}

function createCellElements(gridElem) {
  const cells = []
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement("div")
    cells.push(cell)
    cell.classList.add("cell")
    gridElem.append(cell)
  }
  return cells
}
