// canvas- can create 2D/3D animations or games in browser
const canvas = document.getElementById('game')
const context = canvas.getContext('2d')

// create 'T' block
/*
function requestAnimationFrame (callback) {
  if (typeof callback !== 'function') {
    callback = false
  }
  if (callback) {
    callback()
  }
}
*/
context.scale(20, 20)

function arenaDeleteRow () {
  let rowCount = 0
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer
      }
    }
    const row = arena.splice(y, 1)[0].fill(0)
    arena.unshift(row)
    ++y
    player.score += rowCount * 10
    rowCount *= 2
  }
}

function collide (arena, player) {
  const [m, o] = [player.matrix, player.position]
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
        return true
      }
    }
  }
  return false
}

function createMatrix (w, h) {
  const matrix = []
  while (h--) {
    matrix.push(new Array(w).fill(0))
  }
  return matrix
}

function draw () {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  drawMatrix(arena, { x: 0, y: 0 })
  drawMatrix(player.matrix, player.position)
}

function drawMatrix (matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value]
        context.fillRect(x + offset.x,
          y + offset.y,
          1, 1)
      }
    })
  })
}

function merge (arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.position.y][x + player.position.x] = value
      }
    })
  })
}

function playerDrop () {
  player.position.y++
  if (collide(arena, player)) {
    player.position.y--
    merge(arena, player)
    playerReset()
    arenaDeleteRow()
    updateScore()
  }
  dropCounter = 0
}

function playerMove (direction) {
  player.position.x += direction
  if (collide(arena, player)) {
    player.position.x -= direction
  }
}

function playerReset () {
  const pieces = 'ILJOTSZ'
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0])
  player.position.y = 0
  player.position.x = (arena[0].length / 2 | 0) -
    (player.matrix[0].length / 2 | 0)
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0))
    player.score = 0
    updateScore()
  }
}

function playerRotate (direction) {
  let offset = 1
  rotate(player.matrix, direction)
  while (collide(arena, player)) {
    const position = player.position.x
    player.position.x += offset
    offset = -(offset = (offset > 0 ? 1 : -1))
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -direction)
      player.position.x = position
      return
    }
  }
}

function rotate (matrix, direction) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x]
      ] = [
        matrix[y][x],
        matrix[x][y]
      ]
    }
    if (direction > 0) {
      matrix.forEach(row => row.reverse())
    } else {
      matrix.reverse()
    }
  }
}

let dropCounter = 0
let dropInterval = 1000

let lastTime = 0
function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    playerDrop()
  }
  draw()
  requestAnimationFrame(update)
}

const arena = createMatrix(12, 20)
// console.log(arena)

function updateScore () {
  document.getElementById('score').innerText = player.score
}

const colors = [
  null,
  'red',
  'blue',
  'green',
  'pink',
  'yellow',
  'purple',
  'orange'
]

const player = {
  position: { x: 0, y: 0 },
  matrix: null,
  score: 0
}

function createPiece (type) {
  if (type === 'T') {
    return [
      [1, 0, 0],
      [1, 1, 0],
      [1, 0, 0]
    ]
  } else if (type === 'S') {
    return [
      [7, 0, 0],
      [7, 7, 0],
      [0, 7, 0]
    ]
  } else if (type === 'Z') {
    return [
      [0, 0, 2],
      [0, 2, 2],
      [0, 2, 0]
    ]
  } else if (type === 'O') {
    return [
      [3, 3],
      [3, 3],
    ]
  } else if (type === 'I') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [0, 4, 0],
      [0, 4, 0]
    ]
  } else if (type === 'L') {
    return [
      [0, 5, 5],
      [0, 5, 0],
      [0, 5, 0]
    ]
  } else if (type === 'J') {
    return [
      [6, 6, 0],
      [0, 6, 0],
      [0, 6, 0]
    ]
  }
}

document.addEventListener('keydown', event => {
  if (event.keyCode === 37) {
    playerMove(-1)
  } else if (event.keyCode === 39) {
    playerMove(1)
  } else if (event.keyCode === 40) {
    playerDrop()
  } else if (event.keyCode === 81) {
    playerRotate(-1)
  } else if (event.keyCode === 87) {
    playerRotate(1)
  }
})

playerReset()
updateScore()
update()
