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
import { CameraRig, CameraAction, StoryPointsControls, ThreeDOFControls } from 'three-story-controls'

const canvasParent = document.querySelector('.canvas-parent')
const nextBtn = document.querySelector('.next')
const prevBtn = document.querySelector('.prev')
const caption = document.querySelector('.caption p')

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

const storyPoints = [
  {
    meshPosition: new Vector3(0, 0, -30),
    color: 0xff0000,
    phi: Math.PI * 0.5,
    theta: 0,
    caption: 'This is a caption about the RED cone',
  },
  {
    meshPosition: new Vector3(20, 0, -45),
    color: 0xffff00,
    phi: Math.PI * 0.4,
    theta: Math.PI * 0.5,
    caption: 'This is a caption about the YELLOW cone',
  },
  {
    meshPosition: new Vector3(45, 0, 0),
    color: 0xff00ff,
    phi: Math.PI * 0.3,
    theta: -Math.PI,
    caption: 'This is a caption about the PINK cone',
  },
  {
    meshPosition: new Vector3(30, 0, 20),
    color: 0x00ffff,
    phi: Math.PI * 0,
    theta: Math.PI * 0.3,
    caption: 'This is a caption about the TEAL cone',
  },
  {
    meshPosition: new Vector3(-10, 0, 45),
    color: 0x00ff00,
    phi: Math.PI * 0.35,
    theta: -Math.PI * 0.2,
    caption: 'This is a caption about the GREEN cone',
  },
  {
    meshPosition: new Vector3(-40, 0, 20),
    color: 0x0000ff,
    phi: Math.PI * 0.5,
    theta: 0,
    caption: 'This is a caption about the BLUE cone',
  },
]

const cameraPositions = storyPoints.map((item) => {
  const mesh = new Mesh(new ConeGeometry(3, 10, 4), new MeshPhongMaterial({ color: item.color }))
  mesh.position.copy(item.meshPosition)
  scene.add(mesh)

  const lookAtPosition = new Vector3().setFromSphericalCoords(15, item.phi, item.theta).add(mesh.position)
  const mat = new Matrix4().lookAt(lookAtPosition, mesh.position, new Vector3(0, 1, 0))
  const lookAtOrientation = new Quaternion().setFromRotationMatrix(mat)

  return {
    lookAtPosition,
    lookAtOrientation,
  }
})

const rig = new CameraRig(camera, scene)
const controls = new StoryPointsControls(rig, cameraPositions, {
  cycle: true,
})
controls.enable()
controls.goToPOI(0)
const controls3dof = new ThreeDOFControls(rig)
controls3dof.enable()

nextBtn.addEventListener('click', () => controls.nextPOI())
prevBtn.addEventListener('click', () => controls.prevPOI())
controls.addEventListener('update', (event) => {
  if (event.progress > 0.8) {
    caption.innerText = storyPoints[event.upcomingIndex].caption
  }
})

function render(t) {
  window.requestAnimationFrame(render)
  controls.update(t)
  controls3dof.update(t)
  renderer.render(scene, camera)
}

render()
