const map = []

export const SIZE = 30

export function getPoint(x, y) {
  const value = map[x] ? map[x][y] : false
  console.log('get', x, y, value)
  return value
}

export function setPoint(x, y, value) {
  if (!map[x]) {
    map[x] = []
  }
  map[x][y] = value
  console.log('set', x, y, value)
}

export function traverse(callback) {
  const changes = []
  for (let x = 0; x < window.innerWidth / SIZE; x++) {
    for (let y = 0; y < window.innerHeight / SIZE; y++) {
      console.log('traverse', x, y)
      callback(x, y, getPoint(x, y), (_x, _y, _v) => {
        changes.push({ _x, _y, _v })
      })
    }
  }
  changes.forEach(({ _x, _y, _v }) => {
    setPoint(_x, _y, _v)
  })
}

export function around(x, y) {
  return (getPoint(x - 1, y - 1) ? 1 : 0)
    + (getPoint(x - 1, y) ? 1 : 0)
    + (getPoint(x - 1, y + 1) ? 1 : 0)
    + (getPoint(x, y - 1) ? 1 : 0)
    + (getPoint(x, y + 1) ? 1 : 0)
    + (getPoint(x + 1, y - 1) ? 1 : 0)
    + (getPoint(x + 1, y) ? 1 : 0)
    + (getPoint(x + 1, y + 1) ? 1 : 0)
}
