import { Scene, PerspectiveCamera } from 'https://cdn.skypack.dev/three@0.122.0';
import * as ThreebirdControls from './threebird-controls.web.esm.js'

const scene = new Scene()
const camera = new PerspectiveCamera()

console.log(ThreebirdControls, scene, camera)