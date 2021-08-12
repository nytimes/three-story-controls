
<div align="center">
  <h1>Story Controls</h1>
  <img width="500" src="https://media.giphy.com/media/QMim8tRiABuko/giphy.gif" />
  <p>A collection of three.js camera control schemes and helper components. ✨</p>
  <img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-yellow.svg" />
  <a href=""><img alt="Build status" src=""></a><br/>
    •
    <a href="#installation">Installation</a> 
    •
    <a href="#components">Overview</a> 
    •
    <a href="docs/controls.md">API Docs</a> 
    •
    <a href="#contributing">Contributing</a> 
</div>

---


## Demos
* [Camera Helper](https://ubiquitous-fiesta-c641b86c.pages.github.io/examples/demos/camera-helper/index.html): Helper tool to create camera animations and/or points of interest that can be exported and used by the control schemes.
* [FreeMovement controls](https://ubiquitous-fiesta-c641b86c.pages.github.io/examples/demos/freemove/index.html): First-person controls to move freely around the scene
* [Scroll controls](https://ubiquitous-fiesta-c641b86c.pages.github.io/examples/demos/scroll-controls/index.html): Scroll through the page to scrub through a camera animation
* [StoryPoint controls](https://ubiquitous-fiesta-c641b86c.pages.github.io/examples/demos/story-points/index.html): Move between specific points in the scene

---

## Basic Usage
Here is an example using the `FreeMovementControls` scheme, where arrow keys and mouse wheel move the camera, and click-and-drag rotate/turn the camera:

```javascript
import { Scene, PerspectiveCamera, WebGLRenderer, GridHelper } from 'https://cdn.skypack.dev/three@[VERSION]'
import { CameraRig, FreeMovementControls } from './three-story-controls.web.esm.js'

const scene = new Scene()
const camera = new PerspectiveCamera()
const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const rig = new CameraRig(camera, scene)
const controls = new FreeMovementControls(rig)
controls.enable()

function render(t) {
  window.requestAnimationFrame(render)
  controls.update(t)
  renderer.render(scene, camera)
}

render()
```

---

## Installation

**!!NOTE!!:** The library depends on [three.js](https://threejs.org/) and [gsap](https://greensock.com/gsap/), which need to be installed separately. It is recommended to use the same version used by the library:

```
  "gsap": "3.6.1",
  "three": "0.129.0"
```

Replace `[VERSION]` in the code below accordingly.

### 1. Script tag
Download [`dist/three-story-controls.min.js`](dist/three-story-controls.min.js) and include it in your HTML file with a script tag, along with three.js and gsap. This will expose a global variable `ThreeStoryControls`. See [here](examples/installation/script-src) for more:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r[VERSION]/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/[VERSION]/gsap.min.js"></script>
  <script src='three-story-controls.min.js'></script>
  ```

### 2. ES Module
Download [`dist/three-story-controls.esm.min.js`](dist/three-story-controls.esm.min.js) and use an `importmap-shim` to import the dependencies. See [here](examples/installation/es-module) for a full example. The [demos](examples/demos) also use this method of installation:
  #### **`index.html`**
  ```html
  <script async src="https://unpkg.com/es-module-shims@0.11.1/dist/es-module-shims.js"></script>
  <script type="importmap-shim">
  {
    "imports": {
      "three": "https://cdn.skypack.dev/three@0.129.0",
      "gsap": "https://cdn.skypack.dev/gsap@3.6.1",
      "three-story-controls" : "./three-story-controls.esm.min.js"
    }
  }
  </script>
  <script src='index.js' type='module-shim'></script>
  ```
  #### **`index.js`**
  ```javascript
  import { Scene, PerspectiveCamera } from 'three'
  import { ScrollControls } from 'three-story-controls'
  ```

### 3. NPM
If you use a build system such as Webpack / Parcel / Rollup etc, you can also install the library along with three.js and gsap from npm:
```
npm install -s three gsap three-story-controls
```
See [here](examples/installation/webpack) for a webpack example.

---
<br><br>
# Components

## Camera Rig
The core component of the library is the `CameraRig` - a wrapper around three.js camera that makes it easier to specify camera actions such as pan / tilt / dolly etc. without worrying about the existing camera transform. 

```javascript
const rig = new CameraRig(camera, scene)
rig.do(CameraAction.Pan, Math.PI / 6)
rig.do(CameraAction.Tilt, Math.PI / 12)
```

With the default up axis set to `Y`, the actions map like so:
| Action      | Transform         |
| ------      | ---------         |
| Pan         | Rotate around `Y` |
| Tilt        | Rotate around `X` |
| Roll        | Rotate around `Z` |
| Pedestal    | Translate on `Y`  |
| Truck       | Translate on `X`  |
| Dolly       | Translate on `Z`  |

<br>

The `CameraRig` can also be provided with a three.js `AnimationClip` to animate/control it on a predefined rail. See [here](docs/controls.camerarig.md) for more.

---

## Control schemes
The library comes with 5 pre-built control schemes:

| Name | Description |
| ---- | ----------- |
| [FreeMovementControls](docs/controls.freemovementcontrols.md) |  Click-and-drag to rotate the camera up/down/left/right; and WASD, Arrow keys, mouse wheel/trackpad to move forwards/backwards and side-to-side |
| [ScrollControls](docs/controls.scrollcontrols.md) |  Scrub the camera along a path specified by an `AnimationClip` by scrolling through a DOM element |
| [StoryPointControls](docs/controls.storypointscontrols.md) | Transition the camera between specified points |
| [PathPointControls](docs/controls.pathpointscontrols.md) | Transition the camera to specific frames of a path specified by an `AnimationClip` |
| [ThreeDOFControls](docs/controls.threedofcontrols.md) | Rotate the camera slightly while staying in place - intended to be used alongside the other control schemes. |      

---

## Adaptors
Adaptors are responsible for smoothing and transforming input data into something more digestable, and emit events with this transformed data. 
| Name | Description |
| ---- | ----------- |
| [PointerAdaptor](docs/controls.pointeradaptor.md) | Handles pointer movements, click and drag, and multi-touch events  |
| [KeyboardAdaptor](docs/controls.keyboardadaptor.md) | Handles keyboard event for specified keys |
| [ScrollAdaptor](docs/controls.scrolladaptor.md) | Handles calculation for scroll distance for a specified DOM element  |
| [SwipeAdaptor](docs/controls.swipeadaptor.md) | Detects and handles swipe events |
| [WheelAdaptor](docs/controls.wheeladaptor.md) | Handles mouse wheel events and detects thresholded wheel movement | 

---

## Building your own control scheme
You could build your own control schemes using a combination of `Adaptor`s and the `CameraRig`. Extend the [`BaseControls`](src/controlschemes/BaseControls.ts) class, and implement `enable()`, `disable()` and `update(time)` methods. See the existing [control schemes](src/controlschemes) for examples.

---

## API and demos
API documentation lives [here](docs/controls.md), and demos can be viewed [here](https://ubiquitous-fiesta-c641b86c.pages.github.io/). Code for the demos lives in [`examples/demos`](examples/demos)

---

## Contributing
Contributions are welcome! To develop locally, run `npm install` and then `npm run dev` to watch and serve the [demos](examples/demos) directory at `http://localhost:8080`, where you can add a new page to test out changes (please ensure test pages are ignoted by git). 

If you add a new component, be sure to create an example and document it following the [TSDoc](https://tsdoc.org/) standard. The library uses [API Extractor](https://api-extractor.com/), which has [some additional](https://api-extractor.com/pages/tsdoc/doc_comment_syntax/) comment tags available. To extract the documentation, run `npm run build:docs`. For production builds, run `npm run build:production`.


> This repository is maintained by the Research & Development team at The New York Times and is provided as-is for your own use. For more information about R&D at the Times visit [rd.nytimes.com](https://rd.nytimes.com)