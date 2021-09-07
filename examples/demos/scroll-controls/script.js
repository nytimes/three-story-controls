import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AnimationClip,
  GridHelper,
  ConeGeometry,
  MeshPhongMaterial,
  Mesh,
  Vector3,
  HemisphereLight,
} from 'three'
import { CameraRig, ScrollControls, ThreeDOFControls } from 'three-story-controls'
import cameraData from './camera-data.js'

const canvasParent = document.querySelector('.canvas-parent')
const scrollElement = document.querySelector('.scroller')

const scene = new Scene()
const camera = new PerspectiveCamera(45, canvasParent.clientWidth / canvasParent.clientHeight, 0.1, 10000)
const renderer = new WebGLRenderer()
renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight)
canvasParent.appendChild(renderer.domElement)

const light = new HemisphereLight(0xffffbb, 0x080820, 1)
scene.add(light)

const grid = new GridHelper(100, 50)
grid.position.set(0, -5, 0)
scene.add(grid)

const rig = new CameraRig(camera, scene)
rig.setAnimationClip(AnimationClip.parse(cameraData.animationClip))
rig.setAnimationTime(0)

const controls = new ScrollControls(rig, {
  scrollElement,
  dampingFactor: 0.1,
  startOffset: '-50vh',
  endOffset: '-50vh',
  scrollActions: [
    {
      start: '0%',
      end: '15%',
      callback: transitionTop,
    },
    {
      start: '85%',
      end: '100%',
      callback: transitionBottom,
    },
  ],
})

const controls3dof = new ThreeDOFControls(rig, {
  panFactor: Math.PI / 10,
  tiltFactor: Math.PI / 10,
  truckFactor: 0,
  pedestalFactor: 0,
})

function transitionTop(progress) {
  renderer.domElement.style.opacity = progress
}

function transitionBottom(progress) {
  renderer.domElement.style.opacity = 1 - progress
}
controls.enable()
controls3dof.enable()

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
  window.requestAnimationFrame(render)
  if (rig.hasAnimation) {
    controls.update(t)
    controls3dof.update(t)
  }
  renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

render()
