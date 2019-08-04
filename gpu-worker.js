importScripts('./gpu-browser.min.js')

onmessage = (e) => {
  const { WIDTH, HEIGHT, DENSITY, RADIATION, FPS } = e.data

  const initial = []
  const empty = []
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    initial.push(Math.random() < DENSITY ? 1 : 0)
    empty.push(0)
  }

  const gpu = new GPU()

  const prepare = gpu.createKernel(function (a) {
    return a[this.thread.y][this.thread.x]
  }).setOutput([WIDTH, HEIGHT])

  const reproduction = gpu.createKernel(function (a) {
    // variation
    if (Math.random() < this.constants.RADIATION) {
      return Math.round(Math.random() * 2)
    }

    const x = this.thread.x
    const y = this.thread.y

    function checkBoundary(y, x) {
      if (x >= 0 && x < this.constants.WIDTH && y >= 0 && y < this.constants.HEIGHT) {
        return 1
      }
      return 0
    }

    let around = 0
    if (checkBoundary(y - 1, x - 1) === 1) {
      around += a[y - 1][x - 1]
    }
    if (checkBoundary(y - 1, x) === 1) {
      around += a[y - 1][x]
    }
    if (checkBoundary(y - 1, x + 1) === 1) {
      around += a[y - 1][x + 1]
    }
    if (checkBoundary(y, x - 1) === 1) {
      around += a[y][x - 1]
    }
    if (checkBoundary(y, x + 1) === 1) {
      around += a[y][x + 1]
    }
    if (checkBoundary(y + 1, x - 1) === 1) {
      around += a[y + 1][x - 1]
    }
    if (checkBoundary(y + 1, x) === 1) {
      around += a[y + 1][x]
    }
    if (checkBoundary(y + 1, x + 1) === 1) {
      around += a[y + 1][x + 1]
    }

    if (a[y][x] === 1) {
      if (around === 2 || around === 3) {
        return 1
      }
      return 0
    }
    if (around === 3) {
      return 1
    }
    return 0
  })
    .setPipeline(true)
    .setImmutable(true)
    .setOptimizeFloatMemory(true)
    .setStrictIntegers(true)
    .setOutput([WIDTH, HEIGHT])
    .setConstants({ WIDTH, HEIGHT, RADIATION })

  const diff = gpu.createKernel(function (a, b) {
    const x = this.thread.x
    const y = this.thread.y

    if (a[y][x] === b[y][x]) {
      return 0
    }
    if (b[y][x] === 1) {
      return 1
    }
    return -1
  })
    .setImmutable(true)
    .setOptimizeFloatMemory(true)
    .setStrictIntegers(true)
    .setOutput([WIDTH, HEIGHT])

  function getResult(d) {
    const result = []
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (d[y][x] === 1) {
          result.push({ x, y, d: 1 })
        }
        if (d[y][x] === -1) {
          result.push({ x, y, d: -1 })
        }
      }
    }
    return result
  }

  function nextGeneration(c) {
    const cc = reproduction(c)
    const d = diff(c, cc)
    setTimeout(() => {
      postMessage(getResult(d))
    })
    setTimeout(() => {
      nextGeneration(cc)
    }, 1000 / FPS)
  }

  const initialData = prepare(GPU.input(initial, [WIDTH, HEIGHT]))
  const emptyData = prepare(GPU.input(empty, [WIDTH, HEIGHT]))
  const d = diff(emptyData, initialData)
  postMessage(getResult(d))
  nextGeneration(initialData)
}
