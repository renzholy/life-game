const SIZE = 4
const DPR = window.devicePixelRatio || 1
const WIDTH = Math.ceil(window.innerWidth * DPR / SIZE)
const HEIGHT = Math.ceil(window.innerHeight * DPR / SIZE)
const DENSITY = 0.12
const RADIATION = 0.0001
const FPS = 30

const worker = new Worker('gpu-worker.js')

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * DPR
  canvas.height = rect.height * DPR
  const ctx = canvas.getContext('2d')
  return ctx
}

let ctx = setupCanvas(document.getElementById('canvas'))

window.onresize = () => {
  ctx = setupCanvas(document.getElementById('canvas'))
}

function drawPoint(x, y, d) {
  if (d === 1) {
    ctx.fillStyle = '#035C12'
  } else if (d === -1) {
    ctx.fillStyle = '#F3F3F3'
  }
  ctx.fillRect(x * SIZE, y * SIZE, SIZE - 1, SIZE - 1)
}

worker.postMessage({ WIDTH, HEIGHT, DENSITY, RADIATION, FPS })

worker.onmessage = (e) => {
  const result = e.data
  const add = []
  const remove = []
  for (const { x, y, d } of result) {
    drawPoint(x, y, d)
  }
  const fragment = document.createDocumentFragment()
  for (const a of add) {
    fragment.appendChild(a)
  }
  document.body.appendChild(fragment)
  for (const r of remove) {
    document.body.removeChild(r)
  }
}
