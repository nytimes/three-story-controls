import { Scene, PerspectiveCamera, WebGLRenderer, GridHelper } from 'https://cdn.skypack.dev/three@0.122.0'
import { CameraRig, FreeMovementControls } from '../threebird-controls.web.esm.js'

const canvasParent = document.querySelector('.canvas-parent')

const scene = new Scene()
const camera = new PerspectiveCamera()
const renderer = new WebGLRenderer()
renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight)
canvasParent.appendChild(renderer.domElement)

const rig = new CameraRig(camera, scene)
const controls = new FreeMovementControls(rig, {
  domElement: canvasParent,
})
controls.enable()

const grid = new GridHelper(150, 50)
grid.position.set(0, -5, 0)
scene.add(grid)

function render(t) {
  window.requestAnimationFrame(render)
  controls.update(t)
  renderer.render(scene, camera)
}

render()
