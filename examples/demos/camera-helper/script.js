import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  GridHelper,
  ConeGeometry,
  MeshPhongMaterial,
  Mesh,
  Matrix4,
  Quaternion,
  Vector3,
  HemisphereLight,
} from 'three'
import { CameraRig, FreeMovementControls, CameraHelper } from 'three-story-controls'

const canvasParent = document.querySelector('.canvas-parent')

const scene = new Scene()
const camera = new PerspectiveCamera(45, canvasParent.clientWidth / canvasParent.clientHeight, .1, 10000)
const renderer = new WebGLRenderer()
renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight)
canvasParent.appendChild(renderer.domElement)

const light = new HemisphereLight(0xffffbb, 0x080820, 1)
scene.add(light)

const grid = new GridHelper(100, 50)
grid.position.set(0, -5, 0)
scene.add(grid)

const rig = new CameraRig(camera, scene)
const controls = new FreeMovementControls(rig, {
  domElement: canvasParent,
})
controls.enable()

const cameraHelper = new CameraHelper(rig, controls, renderer.domElement)

const cones = [
  {
    meshPosition: new Vector3(0, 0, -30),
    color: 0xff0000,
  },
  {
    meshPosition: new Vector3(20, 0, -45),
    color: 0xffff00, 
  },
  {
    meshPosition: new Vector3(45, 0, 0),
    color: 0xff00ff,
  },
  {
    meshPosition: new Vector3(30, 0, 20),
    color: 0x00ffff,
  },
  {
    meshPosition: new Vector3(-10, 0, 45),
    color: 0x00ff00,
  },
  {
    meshPosition: new Vector3(-40, 0, 20),
    color: 0x0000ff,
  },
]

const coneGeo = new ConeGeometry(3, 10, 4)
cones.forEach((item) => {
  const mesh = new Mesh(coneGeo, new MeshPhongMaterial({ color: item.color }))
  mesh.position.copy(item.meshPosition)
  scene.add(mesh)
})

function render(t) {
  controls.update(t)
  renderer.render(scene, camera)
  cameraHelper.update(t)
  window.requestAnimationFrame(render)
}

render()
