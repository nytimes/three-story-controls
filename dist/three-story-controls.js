(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three'), require('gsap')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three', 'gsap'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ThreeStoryControls = {}, global.THREE, global.gsap));
}(this, (function (exports, three, gsap) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var gsap__default = /*#__PURE__*/_interopDefaultLegacy(gsap);

    /**
     * Damper uses simple linear damping for a given collection of values.
     * On every call to update, the damper will approach a given set of target values.
     * @example
     * ```js
     * const damper = new Damper({
     *  values: {x: 0, y: 0},
     *  dampingFactor: 0.4
     * })
     *
     * damper.setTarget({ x: 1, y: 100 })
     * damper.update() // would generally be called in an animation loop
     * const values = damper.getCurrentValues() // values.x = 0.4; values.y = 40
     * ```
     */
    class Damper {
        constructor(props) {
            this.epsilon = 0.001;
            this.values = {};
            this.targetValues = {};
            this.deltaValues = {};
            Object.assign(this.values, props.values);
            Object.assign(this.targetValues, props.values);
            this.deltaValues = {};
            for (const key in this.values) {
                this.deltaValues[key] = 0;
            }
            this.dampingFactor = props.dampingFactor;
            if (props.epsilon)
                this.epsilon = props.epsilon;
            this.hasReached = true;
        }
        /**
         * Update the damper, should generally be called on every frame
         */
        update() {
            const deltas = {};
            let approached = true;
            for (const key in this.values) {
                deltas[key] = this.targetValues[key] - this.values[key];
                approached = approached && Math.abs(deltas[key]) < this.epsilon;
            }
            if (approached) {
                for (const key in this.values) {
                    this.deltaValues[key] = deltas[key];
                    this.values[key] = this.targetValues[key];
                }
                this.hasReached = true;
            }
            else {
                for (const key in this.values) {
                    this.deltaValues[key] = this.dampingFactor * deltas[key];
                    this.values[key] += this.deltaValues[key];
                }
            }
        }
        /**
         * Set the target values the damper needs to approach
         * @param target DamperValues the damper needs to approach
         */
        setTarget(target) {
            for (const key in target) {
                this.targetValues[key] = target[key];
            }
            this.hasReached = false;
        }
        /**
         * Increment/Decrement a specifc damper target value
         * @param key The key of the value to modify
         * @param value The amount to modify the target by
         */
        addToTarget(key, value) {
            this.targetValues[key] += value;
            this.hasReached = false;
        }
        /**
         * Reset all damper values to the fiven number
         * @param value Number to reset all damper values to
         */
        resetAll(value) {
            for (const key in this.values) {
                this.targetValues[key] = value;
                this.values[key] = value;
                this.deltaValues[key] = 0;
            }
            this.hasReached = true;
        }
        /**
         * Reset damper values as described by the given DamperValues object
         * @param values DamperValues object to reset the damper to
         */
        resetData(values) {
            for (const key in values) {
                this.targetValues[key] = values[key];
                this.values[key] = values[key];
                this.deltaValues[key] = 0;
            }
            this.hasReached = true;
        }
        /**
         * Get the current values
         * @returns DamperValues object with the current values of the damper
         */
        getCurrentValues() {
            return Object.assign({}, this.values);
        }
        /**
         * Get the change in values since the last update call
         * @returns DamperValues object with the amount the values changed since the last `update()` call
         */
        getDeltaValues() {
            return Object.assign({}, this.deltaValues);
        }
        /**
         * Whether the damper has reached its target
         * @returns Whether the damper has reached its target (within permissible error range)
         */
        reachedTarget() {
            return this.hasReached;
        }
    }

    /**
     * Enum of camera actions used to control a {@link three-story-controls#CameraRig}
     */
    exports.CameraAction = void 0;
    (function (CameraAction) {
        CameraAction["Pan"] = "Pan";
        CameraAction["Tilt"] = "Tilt";
        CameraAction["Roll"] = "Roll";
        CameraAction["Truck"] = "Truck";
        CameraAction["Pedestal"] = "Pedestal";
        CameraAction["Dolly"] = "Dolly";
        CameraAction["Zoom"] = "Zoom";
    })(exports.CameraAction || (exports.CameraAction = {}));
    /**
     * Enum of {@link three-story-controls#CameraRig} parts
     */
    exports.RigComponent = void 0;
    (function (RigComponent) {
        RigComponent["Body"] = "body";
        RigComponent["Head"] = "head";
        RigComponent["Eyes"] = "eyes";
    })(exports.RigComponent || (exports.RigComponent = {}));
    /**
     * Enum of axes
     */
    exports.Axis = void 0;
    (function (Axis) {
        Axis["X"] = "x";
        Axis["Y"] = "y";
        Axis["Z"] = "z";
    })(exports.Axis || (exports.Axis = {}));
    const AxisVector = {
        [exports.Axis.X]: new three.Vector3(1, 0, 0),
        [exports.Axis.Y]: new three.Vector3(0, 1, 0),
        [exports.Axis.Z]: new three.Vector3(0, 0, 1),
    };
    const ActionMappingByUpAxis = {
        [exports.Axis.X]: {
            [exports.CameraAction.Pan]: exports.Axis.X,
            [exports.CameraAction.Tilt]: exports.Axis.Z,
            [exports.CameraAction.Roll]: exports.Axis.Y,
        },
        [exports.Axis.Y]: {
            [exports.CameraAction.Pan]: exports.Axis.Y,
            [exports.CameraAction.Tilt]: exports.Axis.X,
            [exports.CameraAction.Roll]: exports.Axis.Z,
        },
        [exports.Axis.Z]: {
            [exports.CameraAction.Pan]: exports.Axis.Z,
            [exports.CameraAction.Tilt]: exports.Axis.Y,
            [exports.CameraAction.Roll]: exports.Axis.X,
        },
    };
    /**
     * The CameraRig holds the camera, and can respond to {@link three-story-controls#CameraAction}s such as Pan/Tilt/Dolly etc. It can also be controlled along a given path (in the form of an `AnimationClip`), or tweened to specified points.
     *
     * @remarks
     * The rig is constructed of three objects, analagous to a body, head and eyes. The camera is nested in the eyes and is never transformed directly.
     *
     * Instead of specifying the axis to rotate/translate the camera, {@link three-story-controls#CameraAction}s are used. The rotation order of actions is always `Pan` then `Tilt` then `Roll`.
     * The mapping of these actions to axes depends on the up axis, which defaults to `Y` (but can be changed with the {@link CameraRig.setUpAxis | setUpAxis() method}):
     *
     * * `CameraAction.Pan` rotates around the `Y` axis
     *
     * * `CameraAction.Tilt` rotates around the `X` axis
     *
     * * `CameraAction.Roll` rotates around the `Z` axis
     *
     * * `CameraAction.Dolly` translates on the `Z` axis
     *
     * * `CameraAction.Truck` translates on the `X` axis
     *
     * * `CameraAction.Pedestal` translates on the `Y` axis
     *
     * Translations will be applied to the 'body' of the rig, and rotations to the 'eyes'. If an animation clip is provided, or the camera is tweened to a specific location,
     * the rotations will be applied to the 'head', thus leaving the 'eyes' free to 'look around' from this base position.
     *
     * Additionally, the default setup assumes that the rig will move forward/backward (`Dolly`) in the direction the camera is panned to.
     * This can be configured through {@link CameraRig.translateAlong | translateAlong property}.
     * It can also be overwritten by providing the component name to the {@link CameraRig.do | do() method}, see {@link https://github.com/nytimes/three-story-controls/blob/main/src/controlschemes/ThreeDOFControls.ts#L96 | ThreeDOFControls implementation} for an example.
     *
     * To move the rig along a specified path, use the {@link CameraRig.setAnimationClip | setAnimationClip() method},
     *  and set the names for the `Translation` and `Rotation` objects to match those of the clip. The clip should have a `VectorKeyframeTrack` for the outer position/translation object,
     *  and a `QuaternionKeyframeTrack` for the inner orientation/rotation object.
     *
     * See {@link three-story-controls#CameraMoveStartEvent}, {@link three-story-controls#CameraMoveUpdateEvent} and {@link three-story-controls#CameraMoveEndEvent} for emitted event signatures.
     */
    class CameraRig extends three.EventDispatcher {
        // Constructor
        constructor(camera, scene) {
            super();
            this.inTransit = false;
            this.upAxis = exports.Axis.Y;
            this.actionAxes = ActionMappingByUpAxis[this.upAxis];
            this.hasAnimation = false;
            this.animationTranslationObjectName = 'Translation';
            this.animationRotationObjectName = 'Rotation';
            this.translateAlong = {
                [exports.CameraAction.Tilt]: false,
                [exports.CameraAction.Pan]: true,
                [exports.CameraAction.Roll]: false,
            };
            this.camera = camera;
            this.scene = scene;
            this.body = new three.Object3D();
            this.head = new three.Object3D();
            this.eyes = new three.Object3D();
            this.head.name = this.animationRotationObjectName;
            this.body.name = this.animationTranslationObjectName;
            this.body.rotation.order = this.getRotationOrder();
            this.head.rotation.order = this.getRotationOrder();
            this.eyes.rotation.order = this.getRotationOrder();
            this.scene.add(this.body.add(this.head.add(this.eyes.add(this.camera))));
            this.cameraIsInRig = true;
            this.unpackTransform();
        }
        /**
         * Get the axis for a given action
         * @param action
         * @returns x | y | z
         */
        getAxisFor(action) {
            return this.actionAxes[action];
        }
        /**
         * Get the axis' vector for a given action
         * @param action
         * @returns Normalized vector for the axis
         */
        getAxisVectorFor(action) {
            return AxisVector[this.actionAxes[action]];
        }
        /**
         * Main method for controlling the camera
         * @param action - Action to perform
         * @param amount - Amount to move/rotate/etc
         * @param rigComponent - Override the default component to perform the action on
         */
        do(action, amount, rigComponent) {
            const targetComponent = this[rigComponent];
            switch (action) {
                case exports.CameraAction.Pan:
                case exports.CameraAction.Tilt:
                case exports.CameraAction.Roll: {
                    const axis = this.getAxisVectorFor(action);
                    if (targetComponent) {
                        targetComponent.rotateOnAxis(axis, amount);
                    }
                    else if (this.translateAlong[action]) {
                        this.body.rotateOnAxis(axis, amount);
                    }
                    else {
                        this.eyes.rotateOnAxis(axis, amount);
                    }
                    break;
                }
                case exports.CameraAction.Truck: {
                    const axis = this.getAxisVectorFor(exports.CameraAction.Tilt);
                    const component = targetComponent || this.body;
                    component.translateOnAxis(axis, amount);
                    break;
                }
                case exports.CameraAction.Pedestal: {
                    const axis = this.getAxisVectorFor(exports.CameraAction.Pan);
                    const component = targetComponent || this.body;
                    component.translateOnAxis(axis, amount);
                    break;
                }
                case exports.CameraAction.Dolly: {
                    const axis = this.getAxisVectorFor(exports.CameraAction.Roll);
                    const component = targetComponent || this.body;
                    component.translateOnAxis(axis, amount);
                    break;
                }
                case exports.CameraAction.Zoom: {
                    if (this.camera instanceof three.PerspectiveCamera) {
                        this.camera.fov = amount;
                        this.camera.updateProjectionMatrix();
                    }
                    break;
                }
            }
        }
        /**
         * Get world position and orientation of the camera
         */
        getWorldCoordinates() {
            const position = new three.Vector3();
            this.camera.getWorldPosition(position);
            const quaternion = new three.Quaternion();
            this.camera.getWorldQuaternion(quaternion);
            return { position, quaternion };
        }
        /**
         * Sets world coordinates for the camera, and configures rig component transforms accordingly.
         * @param param0
         */
        setWorldCoordinates({ position, quaternion }) {
            const currentRotation = new three.Euler().setFromQuaternion(quaternion, this.getRotationOrder());
            const actions = [exports.CameraAction.Pan, exports.CameraAction.Tilt, exports.CameraAction.Roll];
            this.eyes.position.set(0, 0, 0);
            this.eyes.rotation.set(0, 0, 0);
            this.head.position.set(0, 0, 0);
            this.head.rotation.set(0, 0, 0);
            this.body.position.copy(position);
            actions.forEach((action) => {
                const axis = this.getAxisFor(action);
                if (this.translateAlong[action]) {
                    this.body.rotation[axis] = currentRotation[axis];
                }
                else {
                    this.eyes.rotation[axis] = currentRotation[axis];
                }
            });
            this.camera.rotation.set(0, 0, 0);
            this.camera.position.set(0, 0, 0);
        }
        /**
         * Packs transfrom into the body and head, and 0s out transforms of the eyes. Useful for preparing the
         * rig for control through an animation clip.
         */
        packTransform() {
            const { position, quaternion } = this.getWorldCoordinates();
            this.body.position.copy(position);
            this.body.rotation.set(0, 0, 0);
            this.head.quaternion.copy(quaternion);
            this.head.position.set(0, 0, 0);
            this.eyes.position.set(0, 0, 0);
            this.eyes.rotation.set(0, 0, 0);
        }
        /**
         * Unpacks the current camera world coordinates and distributes transforms
         * across the rig componenets.
         */
        unpackTransform() {
            const { position, quaternion } = this.getWorldCoordinates();
            this.setWorldCoordinates({ position, quaternion });
        }
        /**
         * Disassemble the camera from the rig and attach it to the scene.
         */
        disassemble() {
            if (this.cameraIsInRig) {
                this.scene.attach(this.camera);
                this.cameraIsInRig = false;
            }
        }
        /**
         * Place the camera back in the rig
         */
        assemble() {
            if (!this.cameraIsInRig) {
                this.eyes.attach(this.camera);
                this.unpackTransform();
                this.cameraIsInRig = true;
            }
        }
        /**
         * Get the rotation order as a string compatible with what three.js uses
         */
        getRotationOrder() {
            return Object.values(this.actionAxes).join('').toUpperCase();
        }
        /**
         * Whether the camera is currently attached to the rig
         */
        isInRig() {
            return this.cameraIsInRig;
        }
        /**
         * If the camera is in the middle of a transition
         */
        isMoving() {
            return this.inTransit;
        }
        /**
         * Set the up axis for the camera
         * @param axis - New Up axis
         */
        setUpAxis(axis) {
            this.upAxis = axis;
            this.actionAxes = ActionMappingByUpAxis[this.upAxis];
            this.body.rotation.order = this.getRotationOrder();
        }
        /**
         * Set an animation clip for the rig
         * @param {AnimationClip} clip - AnimationClip containing a VectorKeyFrameTrack for position and a QuaternionKeyFrameTrack for rotation
         * @param {string} translationObjectName - Name of translation object
         * @param {string} rotationObjectName -  Name of rotation object
         */
        setAnimationClip(clip, translationObjectName, rotationObjectName) {
            this.animationClip = clip;
            if (translationObjectName)
                this.animationTranslationObjectName = translationObjectName;
            if (rotationObjectName)
                this.animationRotationObjectName = rotationObjectName;
            this.hasAnimation = true;
            // hack. threejs skips last frame when seek time = clip duration
            this.animationClip.duration += 0.01;
            this.mixer = new three.AnimationMixer(this.body);
            const action = this.mixer.clipAction(this.animationClip);
            action.clampWhenFinished = true;
            action.play();
        }
        /**
         * Transition to a specific position and orientation in world space.
         * Transform on eyes will be reset to 0 as a result of this.
         * @param position
         * @param quaternion
         * @param duration
         * @param ease
         * @param useSlerp
         */
        flyTo(position, quaternion, duration = 1, ease = 'power1', useSlerp = true) {
            if (!this.isMoving()) {
                const currentCoords = this.getWorldCoordinates();
                const currentValues = {
                    px: currentCoords.position.x,
                    py: currentCoords.position.y,
                    pz: currentCoords.position.z,
                    qx: currentCoords.quaternion.x,
                    qy: currentCoords.quaternion.y,
                    qz: currentCoords.quaternion.z,
                    qw: currentCoords.quaternion.w,
                    slerpAmt: 0,
                };
                const targetValues = {
                    px: position.x,
                    py: position.y,
                    pz: position.z,
                    qx: quaternion.x,
                    qy: quaternion.y,
                    qz: quaternion.z,
                    qw: quaternion.w,
                    slerpAmt: 1,
                };
                const tempQuaternion = new three.Quaternion();
                const startQuaternion = new three.Quaternion(currentValues.qx, currentValues.qy, currentValues.qz, currentValues.qw);
                const onStart = () => {
                    this.inTransit = true;
                    this.packTransform();
                    this.dispatchEvent({ type: 'CameraMoveStart' });
                };
                const onUpdate = (tween) => {
                    this.body.position.set(currentValues.px, currentValues.py, currentValues.pz);
                    if (useSlerp) {
                        tempQuaternion.slerpQuaternions(startQuaternion, quaternion, currentValues.slerpAmt);
                        this.head.setRotationFromQuaternion(tempQuaternion);
                    }
                    else {
                        this.head.quaternion.set(currentValues.qx, currentValues.qy, currentValues.qz, currentValues.qw);
                    }
                    this.dispatchEvent({
                        type: 'CameraMoveUpdate',
                        progress: tween.progress(),
                    });
                };
                const onComplete = () => {
                    this.inTransit = false;
                    this.unpackTransform();
                    this.dispatchEvent({ type: 'CameraMoveEnd' });
                };
                gsap__default['default'].to(currentValues, Object.assign(Object.assign({ duration,
                    ease }, targetValues), { onStart, onUpdate: function () {
                        onUpdate(this);
                    }, onComplete }));
            }
        }
        /**
         * Transition to a specific keyframe on the animation clip
         * Transform on eyes will be reset to 0 as a result of this.
         * @param frame - frame
         * @param duration - duration
         * @param ease - ease
         */
        flyToKeyframe(frame, duration = 1, ease = 'power1') {
            if (this.hasAnimation && !this.isMoving()) {
                const currentValues = {
                    time: this.mixer.time,
                };
                const targetValues = {
                    time: this.animationClip.tracks[0].times[frame],
                };
                const onStart = () => {
                    this.inTransit = true;
                    this.dispatchEvent({ type: 'CameraMoveStart' });
                };
                const onUpdate = (tween) => {
                    this.mixer.setTime(currentValues.time);
                    this.dispatchEvent({
                        type: 'CameraMoveUpdate',
                        progress: tween.progress(),
                    });
                };
                const onComplete = () => {
                    this.inTransit = false;
                    this.dispatchEvent({ type: 'CameraMoveEnd' });
                };
                gsap__default['default'].to(currentValues, Object.assign(Object.assign({ duration,
                    ease }, targetValues), { onStart, onUpdate: function () {
                        onUpdate(this);
                    }, onComplete }));
            }
        }
        /**
         * @param percentage - percentage of animation clip to move to, between 0 and 1
         */
        setAnimationPercentage(percentage) {
            if (this.hasAnimation) {
                const percent = Math.max(0, Math.min(percentage * this.animationClip.duration, this.animationClip.duration - 0.0001));
                this.mixer.setTime(percent);
            }
        }
        /**
         * @param time - timestamp of animation clip to move to
         */
        setAnimationTime(time) {
            if (this.hasAnimation)
                this.mixer.setTime(time);
        }
        /**
         * @param frame - frame of animation clip to move to
         */
        setAnimationKeyframe(frame) {
            if (this.hasAnimation)
                this.mixer.setTime(this.animationClip.tracks[0].times[frame]);
        }
    }

    class BaseAdaptor extends three.EventDispatcher {
        constructor() {
            super();
        }
    }

    const defaultProps$9 = {
        keyMapping: {
            forward: ['ArrowUp', 'w', 'W'],
            backward: ['ArrowDown', 's', 'S'],
            left: ['ArrowLeft', 'a', 'A'],
            right: ['ArrowRight', 'd', 'D'],
            up: ['u', 'U'],
            down: ['n', 'N'],
        },
        dampingFactor: 0.5,
        incrementor: 1,
        preventBubbling: true,
    };
    /**
     * Parse keyboard events and emit either dampened values for continuous keypresses, or trigger events named according to a provided keymapping.
     * @remarks
     * See {@link three-story-controls#KeyboardAdaptorProps} for all properties that can be passed to the constructor.
     * See {@link three-story-controls#KeyboardAdaptorDiscreteEvent} and {@link three-story-controls#KeyboardAdaptorContinuousEvent} for emitted event signatures.
     * @example Continuous adaptor
     * ```javascript
     * const keyboardAdaptor = new KeyboardAdaptor({ type: 'continuous', dampingFactor: 0.2 })
     * keyboardAdaptor.connect()
     * keyboardAdaptor.addEventListener('update', (event) => {
     *   cube.rotation.y += event.deltas.right - event.deltas.left
     *   cube.rotation.x += event.deltas.up - event.deltas.down
     * )}
     * function animate() {
     *  keyboardAdaptor.update()
     *  window.requestAnimationFrame(animate)
     * }
     * animate()
     * ```
     */
    class KeyboardAdaptor extends BaseAdaptor {
        constructor(props) {
            super();
            Object.assign(this, defaultProps$9, props);
            const values = {};
            for (const key in this.keyMapping) {
                values[key] = 0;
            }
            this.damper = new Damper({
                values,
                dampingFactor: this.dampingFactor,
            });
            this.onKeyUp = this.onKeyUp.bind(this);
            this.onKeyDown = this.onKeyDown.bind(this);
        }
        connect() {
            document.addEventListener('keyup', this.onKeyUp, true);
            document.addEventListener('keydown', this.onKeyDown, true);
            this.connected = true;
        }
        disconnect() {
            document.removeEventListener('keyup', this.onKeyUp, true);
            document.removeEventListener('keydown', this.onKeyDown, true);
            this.connected = false;
        }
        update() {
            if (this.type === 'continuous' && !this.damper.reachedTarget()) {
                this.damper.update();
                this.dispatchEvent({
                    type: 'update',
                    values: this.damper.getCurrentValues(),
                    deltas: this.damper.getDeltaValues(),
                });
                if (this.damper.reachedTarget()) {
                    this.damper.resetAll(0);
                    this.dispatchEvent({
                        type: 'inertiacomplete',
                    });
                }
            }
        }
        isEnabled() {
            return this.connected;
        }
        onKeyUp(event) {
            if (this.type === 'discrete') {
                for (const name in this.keyMapping) {
                    if (this.keyMapping[name].includes(event.key)) {
                        if (this.preventBubbling)
                            event.preventDefault();
                        this.dispatchEvent({
                            type: 'trigger',
                            trigger: name,
                        });
                        break;
                    }
                }
            }
        }
        onKeyDown(event) {
            if (this.type === 'continuous') {
                for (const name in this.keyMapping) {
                    if (this.keyMapping[name].includes(event.key)) {
                        if (this.preventBubbling)
                            event.preventDefault();
                        this.damper.addToTarget(name, this.incrementor);
                        break;
                    }
                }
            }
        }
    }

    const defaultProps$8 = {
        domElement: document.body,
        dampingFactor: 0.5,
        shouldNormalize: true,
        normalizeAroundZero: true,
        multipointerThreshold: 100,
    };
    /**
     * Parse pointer events to emit dampened, normalized coordinates along with the pointer count (for detecting multi-touch or drag events)
     * @remarks
     * See {@link three-story-controls#PointerAdaptorProps} for all properties that can be passed to the constructor.
     * See {@link three-story-controls#PointerAdaptorEvent} for emitted event signatures.
     * Note: CSS property `touch-action: none` will probably be needed on listener element.
     * @example Pointer adaptor
     * ```javascript
     * const pointerAdaptor = new PointerAdaptor()
     * pointerAdaptor.connect()
     * pointerAdaptor.addEventListener('update', (event) => {
     *  switch(event.pointerCount) {
     *    case 0:
     *      cube.scale.x = event.values.x
     *      cube.scale.y = event.values.y
     *      break
     *    case 1:
     *      cube.position.x += event.deltas.x
     *      cube.position.y -= event.deltas.y
     *      break
     *    default:
     *      break
     *  }
     * })
     *
     * // in RAF loop:
     * function animate(t) {
     *  pointerAdaptor.update(t)
     * }
     * ```
     */
    class PointerAdaptor extends BaseAdaptor {
        constructor(props) {
            super();
            this.domElement = document.body;
            this.shouldNormalize = true;
            this.normalizeAroundZero = true;
            this.pointerCount = 0;
            this.recordedPosition = false;
            this.cache = [];
            this.lastDownTime = 0;
            this.lastUpTime = 0;
            Object.assign(this, defaultProps$8, props);
            this.damper = new Damper({
                values: { x: null, y: null },
                dampingFactor: this.dampingFactor,
            });
            this.setDimensions();
            this.onPointerMove = this.onPointerMove.bind(this);
            this.onPointerUp = this.onPointerUp.bind(this);
            this.onPointerDown = this.onPointerDown.bind(this);
            this.onResize = this.onResize.bind(this);
        }
        connect() {
            this.domElement.addEventListener('pointermove', this.onPointerMove, { passive: true });
            this.domElement.addEventListener('pointerdown', this.onPointerDown, { passive: true });
            this.domElement.addEventListener('pointerleave', this.onPointerUp, { passive: true });
            this.domElement.addEventListener('pointerup', this.onPointerUp, { passive: true });
            window.addEventListener('resize', this.onResize);
            this.connected = true;
        }
        disconnect() {
            this.domElement.removeEventListener('pointermove', this.onPointerMove);
            this.domElement.removeEventListener('pointerdown', this.onPointerDown);
            this.domElement.removeEventListener('pointerleave', this.onPointerUp);
            this.domElement.removeEventListener('pointerup', this.onPointerUp);
            this.connected = false;
        }
        update(time) {
            if (this.pointerCount !== this.cache.length &&
                time - this.lastDownTime > this.multipointerThreshold &&
                time - this.lastUpTime > this.multipointerThreshold) {
                this.pointerCount = this.cache.length;
                if (this.pointerCount === 0) {
                    this.damper.resetAll(null);
                    this.recordedPosition = false;
                }
                else {
                    this.damper.resetData(this.getPointerPosition(this.cache[0]));
                    this.recordedPosition = true;
                }
            }
            if (!this.damper.reachedTarget()) {
                this.damper.update();
                this.dispatchEvent({
                    type: 'update',
                    values: this.shouldNormalize
                        ? this.normalize(this.damper.getCurrentValues(), this.normalizeAroundZero)
                        : this.damper.getCurrentValues(),
                    deltas: this.shouldNormalize
                        ? this.normalize(this.damper.getDeltaValues(), false)
                        : this.damper.getDeltaValues(),
                    pointerCount: this.pointerCount,
                });
                if (this.damper.reachedTarget()) {
                    this.dispatchEvent({ type: 'inertiacomplete' });
                }
            }
        }
        isEnabled() {
            return this.connected;
        }
        setDimensions() {
            this.width = this.domElement.getBoundingClientRect().width;
            this.height = this.domElement.getBoundingClientRect().height;
        }
        getPointerPosition(event) {
            // event.offsetLeft is still experimental
            return {
                x: Math.max(0, Math.min(this.width, event.x - this.domElement.offsetLeft)),
                y: Math.max(0, Math.min(this.height, event.y - this.domElement.offsetTop)),
            };
        }
        normalize(values, aroundZero) {
            let x = values.x / this.width;
            let y = values.y / this.height;
            if (aroundZero) {
                x = x * 2 - 1;
                y = y * 2 - 1;
            }
            return { x, y };
        }
        onPointerMove(event) {
            if (this.pointerCount === this.cache.length) {
                if (this.cache.length === 0) {
                    if (!this.recordedPosition) {
                        this.damper.resetData(this.getPointerPosition(event));
                        this.recordedPosition = true;
                    }
                    else {
                        this.damper.setTarget(this.getPointerPosition(event));
                    }
                }
                else {
                    if (event.pointerId === this.cache[0].pointerId) {
                        this.damper.setTarget(this.getPointerPosition(event));
                    }
                }
            }
        }
        onPointerDown(event) {
            // only deals with left mouse button right now
            // TODO: add some logic for optional right button events
            if (event.button === 0) {
                this.cache.push(event);
                this.lastDownTime = window.performance.now();
            }
        }
        onPointerUp(event) {
            if (event.button === 0 || event.type === 'pointerleave') {
                for (let i = 0; i < this.cache.length; i++) {
                    if (this.cache[i].pointerId == event.pointerId) {
                        this.cache.splice(i, 1);
                        break;
                    }
                }
                this.lastUpTime = window.performance.now();
            }
        }
        onResize() {
            this.setDimensions();
        }
    }

    const defaultProps$7 = {
        startOffset: '0px',
        endOffset: '0px',
        buffer: 0.1,
        dampingFactor: 0.5,
    };
    /**
     * Emits normalized values for the amount a given DOM element has been scrolled through.
     * @remarks
     * See {@link three-story-controls#ScrollAdaptorProps} for all properties that can be passed to the constructor.
     * See {@link three-story-controls#ScrollAdaptorEvent} for emitted event signatures.
     * @example Scroll adaptor
     * ```javascript
     * const scrollAdaptor = new ScrollAdaptor({ scrollElement: document.querySelector('.scroller'), dampingFactor: 0.1 })
     * scrollAdaptor.connect()
     * scrollAdaptor.addEventListener('update', (event) => {
     *   cube.rotation.y = event.dampenedValues.scrollPercent*Math.PI*2
     * })
     * ```
     */
    class ScrollAdaptor extends BaseAdaptor {
        constructor(props) {
            super();
            Object.assign(this, defaultProps$7, props);
            this.lastSeenScrollValue = window.scrollY || -1;
            this.previousScrollValue = this.lastSeenScrollValue;
            this.values = {
                scrollPx: null,
                scrollPercent: null,
            };
            this.damper = new Damper({
                values: this.values,
                dampingFactor: this.dampingFactor,
            });
            this.calculateDimensions = this.calculateDimensions.bind(this);
            this.onScroll = this.onScroll.bind(this);
            this.resizeObserver = new ResizeObserver(this.calculateDimensions);
            this.calculateDimensions();
        }
        connect() {
            window.addEventListener('scroll', this.onScroll, { passive: true });
            this.resizeObserver.observe(document.body);
            this.connected = true;
        }
        disconnect() {
            window.removeEventListener('scroll', this.onScroll);
            this.resizeObserver.unobserve(document.body);
            this.connected = false;
        }
        update() {
            if (this.lastSeenScrollValue !== this.previousScrollValue &&
                this.lastSeenScrollValue >= this.bufferedStartPosition &&
                this.lastSeenScrollValue <= this.bufferedEndPosition) {
                const scrollPx = Math.max(0, Math.min(this.distance, this.lastSeenScrollValue - this.startPosition));
                const scrollPercent = Math.max(0, Math.min(1, scrollPx / this.distance));
                this.values = {
                    scrollPx,
                    scrollPercent,
                };
                this.damper.setTarget(this.values);
                this.previousScrollValue = this.lastSeenScrollValue;
            }
            if (!this.damper.reachedTarget()) {
                this.damper.update();
                this.dispatchEvent({
                    type: 'update',
                    values: this.values,
                    dampenedValues: this.damper.getCurrentValues(),
                });
                if (this.damper.reachedTarget()) {
                    this.dispatchEvent({ type: 'inertiacomplete' });
                }
            }
        }
        isEnabled() {
            return this.connected;
        }
        parseOffset(offset) {
            let amount = 0;
            if (offset) {
                amount = parseInt(offset);
                if (offset.indexOf('vh') !== -1) {
                    amount = (amount * window.innerHeight) / 100;
                }
                else if (this.distance && offset.indexOf('%') !== -1) {
                    amount = (amount * this.distance) / 100;
                }
            }
            return amount;
        }
        calculateOffset(element) {
            if (!element)
                return 0;
            return this.calculateOffset(element.offsetParent) + element.offsetTop;
        }
        calculateDimensions() {
            const elementHeight = this.scrollElement.clientHeight;
            const offsetTop = this.calculateOffset(this.scrollElement);
            this.startPosition = offsetTop - window.innerHeight + this.parseOffset(this.startOffset);
            this.endPosition = offsetTop + elementHeight + this.parseOffset(this.endOffset);
            this.distance = this.endPosition - this.startPosition;
            this.bufferedStartPosition = Math.max(0, this.startPosition * (1 - this.buffer));
            this.bufferedEndPosition = Math.min(this.endPosition * (1 + this.buffer), document.body.getBoundingClientRect().height);
        }
        onScroll() {
            this.lastSeenScrollValue = window.scrollY;
        }
    }

    const defaultProps$6 = {
        domElement: document.body,
        thresholdX: 60,
        thresholdY: 60,
    };
    /**
     * Emits events in response to swipe gestures above a given threshold.
     * @remarks
     * See {@link three-story-controls#SwipeAdaptorProps} for all properties that can be passed to the constructor.
     * See {@link three-story-controls#SwipeAdaptorEvent} for emitted event signatures.
     * Note: CSS property `touch-action: none` will probably be needed on listener element
     * @example Swipe adaptor
     * ```javascript
     * const swipeAdaptor = new SwipeAdaptor()
     * swipeAdaptor.connect()
     * swipeAdaptor.addEventListener('trigger', (event) => {
     *   cube.scale.y += event.y*0.1
     * })
     * ```
     */
    class SwipeAdaptor extends BaseAdaptor {
        constructor(props = {}) {
            super();
            Object.assign(this, defaultProps$6, props);
            this.onPointerUp = this.onPointerUp.bind(this);
            this.onPointerDown = this.onPointerDown.bind(this);
        }
        connect() {
            this.domElement.addEventListener('pointerdown', this.onPointerDown, { passive: true });
            this.domElement.addEventListener('pointerup', this.onPointerUp, { passive: true });
            this.connected = true;
        }
        disconnect() {
            this.domElement.removeEventListener('pointerdown', this.onPointerDown);
            this.domElement.removeEventListener('pointerup', this.onPointerUp);
            this.connected = false;
        }
        update() {
            // nothing to do here
        }
        isEnabled() {
            return this.connected;
        }
        onPointerDown(event) {
            if (event.pointerType !== 'mouse' && event.isPrimary) {
                this.startX = event.screenX;
                this.startY = event.screenY;
            }
        }
        onPointerUp(event) {
            if (event.pointerType !== 'mouse' && event.isPrimary) {
                const diffX = event.screenX - this.startX;
                const diffY = event.screenY - this.startY;
                if (Math.abs(diffX) >= this.thresholdX || Math.abs(diffY) >= this.thresholdY) {
                    this.dispatchEvent({
                        type: 'trigger',
                        x: Math.abs(diffX) >= this.thresholdX ? Math.sign(diffX) : 0,
                        y: Math.abs(diffY) >= this.thresholdY ? Math.sign(-1 * diffY) : 0,
                    });
                }
            }
        }
    }

    const defaultProps$5 = {
        dampingFactor: 0.5,
        thresholdX: 15,
        thresholdY: 15,
        debounceDuration: 700,
    };
    /**
     * Parse mouse wheel events and emit either dampened values, or trigger events for swipes that cross a given threshold.
     * @remarks
     * See {@link three-story-controls#WheelAdaptorProps} for all properties that can be passed to the constructor.
     * See {@link three-story-controls#WheelAdaptorDiscreteEvent} and {@link three-story-controls#WheelAdaptorContinuousEvent} for emitted event signatures.
     * @example Discrete adaptor
     * ```javascript
     * const wheelAdaptor = new WheelAdaptor({ type: 'discrete' })
     * wheelAdaptor.connect()
     * wheelAdaptor.addEventListener('trigger', (event) => {
     *   cube.scale.y += event.y*0.1
     * })
     * ```
     */
    class WheelAdaptor extends BaseAdaptor {
        constructor(props) {
            super();
            this.lastThresholdTrigger = 0;
            Object.assign(this, defaultProps$5, props);
            this.damper = new Damper({
                values: { x: 0, y: 0 },
                dampingFactor: this.dampingFactor,
            });
            this.onWheel = this.onWheel.bind(this);
        }
        connect() {
            const element = this.domElement || window;
            element.addEventListener('wheel', this.onWheel, { passive: true });
            this.connected = true;
        }
        disconnect() {
            const element = this.domElement || window;
            element.removeEventListener('wheel', this.onWheel);
            this.connected = false;
        }
        update() {
            if (this.type === 'continuous' && !this.damper.reachedTarget()) {
                this.damper.update();
                this.dispatchEvent({
                    type: 'update',
                    values: this.damper.getCurrentValues(),
                    deltas: this.damper.getDeltaValues(),
                });
                if (this.damper.reachedTarget()) {
                    this.damper.resetAll(0);
                    this.dispatchEvent({
                        type: 'inertiacomplete',
                    });
                }
            }
        }
        isEnabled() {
            return this.connected;
        }
        onWheel(event) {
            if (this.type === 'continuous') {
                this.damper.addToTarget('x', event.deltaX);
                this.damper.addToTarget('y', event.deltaY);
            }
            else if (this.type === 'discrete') {
                if (Math.abs(event.deltaX) >= this.thresholdX || Math.abs(event.deltaY) >= this.thresholdY) {
                    const now = window.performance.now();
                    if (now - this.lastThresholdTrigger > this.debounceDuration) {
                        this.lastThresholdTrigger = now;
                        this.dispatchEvent({
                            type: 'trigger',
                            x: Math.abs(event.deltaX) >= this.thresholdX ? Math.sign(event.deltaX) : 0,
                            y: Math.abs(event.deltaY) >= this.thresholdY ? Math.sign(event.deltaY) : 0,
                        });
                    }
                }
            }
        }
    }

    const defaultProps$4 = {
        domElement: document.body,
        pointerDampFactor: 0.3,
        pointerScaleFactor: 4,
        keyboardDampFactor: 0.5,
        keyboardScaleFactor: 0.5,
        wheelDampFactor: 0.25,
        wheelScaleFactor: 0.05,
        panDegreeFactor: Math.PI / 4,
        tiltDegreeFactor: Math.PI / 10,
    };
    /**
     * Control scheme to move the camera with arrow/WASD keys and mouse wheel; and rotate the camera with click-and-drag events.
     * @remarks
     * Control scheme to move the camera with arrow/WASD keys and mouse wheel; and rotate the camera with click-and-drag events.
     *  On a touch device, 1 finger swipe rotates the camera, and 2 fingers tranlsate/move the camera.
     *
     *
     *  Note: CSS property `touch-action: none` will probably be needed on listener element.
     *
     * See {@link three-story-controls#FreeMovementControlsProps} for all properties that can be passed to the constructor.
     *
     * {@link https://nytimes.github.io/three-story-controls/examples/demos/freemove | DEMO }
     *
     * @example
     * ```js
     * const scene = new Scene()
     * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
     * const cameraRig = new CameraRig(camera, scene)
     * const controls = new FreeMovementControls(cameraRig)
     *
     * controls.enable()
     *
     * // render loop
     * function animate(t) {
     *  controls.update(t)
     * }
     * ```
     *
     */
    class FreeMovementControls {
        /** {@inheritDoc three-story-controls#FreeMovementControlsProps#} */
        constructor(cameraRig, props = {}) {
            this.enabled = false;
            this.cameraRig = cameraRig;
            this.wheelScaleFactor = props.wheelScaleFactor || defaultProps$4.wheelScaleFactor;
            this.pointerScaleFactor = props.pointerScaleFactor || defaultProps$4.pointerScaleFactor;
            this.panDegreeFactor = props.panDegreeFactor || defaultProps$4.panDegreeFactor;
            this.tiltDegreeFactor = props.tiltDegreeFactor || defaultProps$4.tiltDegreeFactor;
            this.keyboardAdaptor = new KeyboardAdaptor({
                type: 'continuous',
                dampingFactor: props.keyboardDampFactor || defaultProps$4.keyboardDampFactor,
                incrementor: props.keyboardScaleFactor || defaultProps$4.keyboardScaleFactor,
            });
            this.wheelAdaptor = new WheelAdaptor({
                type: 'continuous',
                dampingFactor: props.wheelDampFactor || defaultProps$4.wheelDampFactor,
                domElement: props.domElement || defaultProps$4.domElement,
            });
            this.pointerAdaptor = new PointerAdaptor({
                domElement: props.domElement || defaultProps$4.domElement,
                dampingFactor: props.pointerDampFactor || defaultProps$4.pointerDampFactor,
            });
            this.onWheel = this.onWheel.bind(this);
            this.onKey = this.onKey.bind(this);
            this.onPointer = this.onPointer.bind(this);
        }
        isEnabled() {
            return this.enabled;
        }
        enable() {
            this.wheelAdaptor.connect();
            this.keyboardAdaptor.connect();
            this.pointerAdaptor.connect();
            this.wheelAdaptor.addEventListener('update', this.onWheel);
            this.keyboardAdaptor.addEventListener('update', this.onKey);
            this.pointerAdaptor.addEventListener('update', this.onPointer);
            this.enabled = true;
        }
        disable() {
            this.wheelAdaptor.disconnect();
            this.keyboardAdaptor.disconnect();
            this.pointerAdaptor.disconnect();
            this.wheelAdaptor.removeEventListener('update', this.onWheel);
            this.keyboardAdaptor.removeEventListener('update', this.onKey);
            this.pointerAdaptor.removeEventListener('update', this.onPointer);
            this.enabled = false;
        }
        onWheel(event) {
            this.cameraRig.do(exports.CameraAction.Dolly, event.deltas.y * this.wheelScaleFactor);
            this.cameraRig.do(exports.CameraAction.Truck, event.deltas.x * this.wheelScaleFactor);
        }
        onKey(event) {
            this.cameraRig.do(exports.CameraAction.Dolly, event.values.backward - event.values.forward);
            this.cameraRig.do(exports.CameraAction.Truck, event.values.right - event.values.left);
            this.cameraRig.do(exports.CameraAction.Pedestal, event.values.up - event.values.down);
        }
        onPointer(event) {
            switch (event.pointerCount) {
                case 1:
                    this.cameraRig.do(exports.CameraAction.Pan, event.deltas.x * this.panDegreeFactor);
                    this.cameraRig.do(exports.CameraAction.Tilt, event.deltas.y * this.tiltDegreeFactor);
                    break;
                case 2:
                    this.cameraRig.do(exports.CameraAction.Dolly, -event.deltas.y * this.pointerScaleFactor);
                    this.cameraRig.do(exports.CameraAction.Truck, -event.deltas.x * this.pointerScaleFactor);
                    break;
            }
        }
        update(time) {
            if (this.enabled) {
                this.keyboardAdaptor.update();
                this.wheelAdaptor.update();
                this.pointerAdaptor.update(time);
            }
        }
    }

    const defaultProps$3 = {
        startOffset: '0px',
        endOffset: '0px',
        dampingFactor: 1,
        buffer: 0.1,
        cameraStart: '0%',
        cameraEnd: '100%',
        scrollActions: [],
    };
    const mapRange = (number, inMin, inMax, outMin, outMax) => {
        return Math.max(outMin, Math.min(outMax, (number - inMin) * ((outMax - outMin) / (inMax - inMin)) + outMin));
    };
    /**
     * Control scheme to scrub through the CameraRig's `AnimationClip` based on the scroll of a DOM Element
     * @remarks
     * Control scheme to scrub through the CameraRig's `AnimationClip` based on the scroll of a DOM Element.
     *  These controls expect to observe an element that is a few viewports long, and use the scroll distance to scrub through a camera animation.
     *  By default, the 'start' of the animation is when the element starts to be in view (ie the top of the element aligns with the bottom of the viewport),
     *  and the 'end' is when the element goes out of view (when the bottom of the elements aligns with the top of the viewport).
     *  These trigger points can be customised with the `cameraStart` and `cameraEnd` properties. Additional scroll-dependant procedures can also be defined through `scrollActions`.
     *
     *
     * See {@link three-story-controls#ScrollControlsProps} for all properties that can be passed to the constructor.
     *
     * {@link https://nytimes.github.io/three-story-controls/examples/demos/scroll-controls/ | DEMO }
     *
     * @example
     * ```js
     * const scene = new Scene()
     * const gltfLoader = new GLTFLoader()
     * const camera = new PerspectiveCamera()
     * const cameraRig = new CameraRig(camera, scene)
     * const controls = new ScrollControls(cameraRig, {
     *  scrollElement: document.querySelector('.scroller'),
     *  cameraStart: '12%',
     *  cameraEnd: '90%',
     *  scrollActions: [
     *    { start: '0%' , end: '10%', callback: e => fadeInElement(e) },
     *    { start: '85%' , end: '100%', callback: e => fadeOutElement(e) }
     *  ]
     * })
     *
     * function fadeInElement(progress) { // entry fade transition }
     * function fadeOutElement(progress) { // exit fade transition }
     *
     * gltfLoader.load(cameraPath, (gltf) => {
     *  cameraRig.setAnimationClip(gltf.animations[0])
     *  cameraRig.setAnimationTime(0)
     *  controls.enable()
     * })
     *
     * // render loop
     * function animate() {
     *  controls.update()
     * }
     * ```
     */
    class ScrollControls {
        constructor(cameraRig, props) {
            this.enabled = false;
            this.cameraRig = cameraRig;
            this.cameraRig.setAnimationTime(0);
            this.scrollAdaptor = new ScrollAdaptor({
                scrollElement: props.scrollElement,
                dampingFactor: props.dampingFactor || defaultProps$3.dampingFactor,
                startOffset: props.startOffset || defaultProps$3.startOffset,
                endOffset: props.endOffset || defaultProps$3.endOffset,
                buffer: props.buffer || defaultProps$3.buffer,
            });
            this.cameraStart = props.cameraStart || defaultProps$3.cameraStart;
            this.cameraEnd = props.cameraEnd || defaultProps$3.cameraEnd;
            this.scrollActions = props.scrollActions || defaultProps$3.scrollActions;
            this.buffer = props.buffer || defaultProps$3.buffer;
            this.calculateStops();
            this.onScroll = this.onScroll.bind(this);
        }
        isEnabled() {
            return this.enabled;
        }
        enable() {
            this.scrollAdaptor.connect();
            this.scrollAdaptor.addEventListener('update', this.onScroll);
            this.enabled = true;
        }
        disable() {
            this.scrollAdaptor.disconnect();
            this.scrollAdaptor.removeEventListener('update', this.onScroll);
            this.enabled = false;
        }
        update() {
            if (this.enabled) {
                this.scrollAdaptor.update();
            }
        }
        calculateStops() {
            this.cameraStartPx = this.scrollAdaptor.parseOffset(this.cameraStart);
            this.cameraEndPx = this.scrollAdaptor.parseOffset(this.cameraEnd);
            this.cameraBufferedStartPx = this.cameraStartPx * (1 - this.buffer);
            this.cameraBufferedEndPx = this.cameraEndPx * (1 + this.buffer);
            this.scrollActions.forEach((action) => {
                action.startPx = this.scrollAdaptor.parseOffset(action.start);
                action.endPx = this.scrollAdaptor.parseOffset(action.end);
                action.bufferedStartPx = action.startPx * (1 - this.buffer);
                action.bufferedEndPx = action.endPx * (1 + this.buffer);
            });
        }
        onScroll(event) {
            const progress = event.dampenedValues.scrollPx;
            if (progress >= this.cameraBufferedStartPx && progress <= this.cameraBufferedEndPx) {
                this.cameraRig.setAnimationPercentage(mapRange(progress, this.cameraStartPx, this.cameraEndPx, 0, 1));
            }
            this.scrollActions.forEach((action) => {
                if (progress >= action.bufferedStartPx && progress <= action.bufferedEndPx) {
                    action.callback(mapRange(progress, action.startPx, action.endPx, 0, 1));
                }
            });
        }
    }

    const defaultProps$2 = {
        cycle: false,
        useKeyboard: true,
    };
    /**
     * Control scheme to transition the camera between given points in world space.
     * @remarks
     * See {@link three-story-controls#StoryPointsControlsProps} for all properties that can be passed to the constructor.
     *
     * See {@link three-story-controls#StoryPointMarker} for POI properties.
     *
     * {@link https://nytimes.github.io/three-story-controls/examples/demos/story-points/ | DEMO }
     *
     * @example
     * ```js
     *
     * const pois = [
     *  { position: new Vector3(...), quaternion: new Quaternion(...) },
     *  { position: new Vector3(...), quaternion: new Quaternion(...) },
     * ]
     * const scene = new Scene()
     * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
     * const cameraRig = new CameraRig(camera, scene)
     * const controls = new StoryPointsControls(cameraRig, pois)
     *
     * controls.enable()
     * controls.goToPOI(0)
     *
     * // Assuming DOM elements with classes 'nextBtn' and 'prevBtn' have been created
     * document.querySelector('.nextBtn').on('click', () => controls.nextPOI() )
     * document.querySelector('.prevBtn').on('click', () => controls.prevPOI() )
     * ```
     */
    class StoryPointsControls extends three.EventDispatcher {
        constructor(cameraRig, pois = [], props = {}) {
            super();
            this.currentIndex = null;
            this.upcomingIndex = null;
            this.enabled = false;
            this.cameraRig = cameraRig;
            this.pois = pois;
            Object.assign(this, defaultProps$2, props);
            if (this.useKeyboard) {
                this.keyboardAdaptor = new KeyboardAdaptor({
                    type: 'discrete',
                    keyMapping: {
                        next: ['ArrowDown', 'ArrowRight'],
                        prev: ['ArrowUp', 'ArrowLeft'],
                    },
                });
                this.onKey = this.onKey.bind(this);
            }
            this.onCameraStart = this.onCameraStart.bind(this);
            this.onCameraUpdate = this.onCameraUpdate.bind(this);
            this.onCameraEnd = this.onCameraEnd.bind(this);
        }
        getCurrentIndex() {
            return this.currentIndex;
        }
        nextPOI() {
            const next = this.currentIndex + 1;
            if (next >= this.pois.length && !this.cycle) {
                this.dispatchEvent({
                    type: 'ExitPOIs',
                    exitFrom: 'end',
                });
            }
            else {
                this.goToPOI(next % this.pois.length);
            }
        }
        prevPOI() {
            const prev = this.currentIndex - 1;
            if (prev < 0 && !this.cycle) {
                this.dispatchEvent({
                    type: 'ExitPOIs',
                    exitFrom: 'start',
                });
            }
            else {
                this.goToPOI((prev + this.pois.length) % this.pois.length);
            }
        }
        goToPOI(index) {
            this.upcomingIndex = index;
            const poi = this.pois[this.upcomingIndex];
            this.cameraRig.flyTo(poi.position, poi.quaternion, poi.duration, poi.ease, poi.useSlerp);
        }
        enable() {
            if (this.useKeyboard) {
                this.keyboardAdaptor.connect();
                this.keyboardAdaptor.addEventListener('trigger', this.onKey);
            }
            this.cameraRig.addEventListener('CameraMoveStart', this.onCameraStart);
            this.cameraRig.addEventListener('CameraMoveUpdate', this.onCameraUpdate);
            this.cameraRig.addEventListener('CameraMoveEnd', this.onCameraEnd);
            this.enabled = true;
        }
        disable() {
            if (this.useKeyboard) {
                this.keyboardAdaptor.disconnect();
                this.keyboardAdaptor.removeEventListener('trigger', this.onKey);
            }
            this.cameraRig.removeEventListener('CameraMoveStart', this.onCameraStart);
            this.cameraRig.removeEventListener('CameraMoveUpdate', this.onCameraUpdate);
            this.cameraRig.removeEventListener('CameraMoveEnd', this.onCameraEnd);
            this.enabled = false;
        }
        update() {
            // nothing to do here
        }
        isEnabled() {
            return this.enabled;
        }
        updatePois(progress) {
            this.dispatchEvent({
                type: 'update',
                currentIndex: this.currentIndex,
                upcomingIndex: this.upcomingIndex,
                progress,
            });
        }
        onCameraStart() {
            this.updatePois(0);
        }
        onCameraUpdate(event) {
            this.updatePois(event.progress);
        }
        onCameraEnd() {
            this.currentIndex = this.upcomingIndex;
            this.upcomingIndex = null;
        }
        onKey(event) {
            if (event.trigger === 'next') {
                this.nextPOI();
            }
            else if (event.trigger === 'prev') {
                this.prevPOI();
            }
        }
    }

    const defaultProps$1 = {
        wheelThreshold: 15,
        swipeThreshold: 60,
        duration: 1,
        ease: 'power1',
        useKeyboard: true,
    };
    /**
     * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
     * @remarks
     * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
     *  A mouse wheel or swipe or keyboard arrow event triggers the camera to smoothly transition from one given frame number to the next.
     *
     *
     * Note: CSS property `touch-action: none` will probably be needed on listener element.
     *
     * See {@link three-story-controls#PathPointsControlsProps} for all properties that can be passed to the constructor.
     *
     * See {@link three-story-controls#PathPointMarker} for POI properties.
     *
     * See {@link three-story-controls#UpdatePOIsEvent} and {@link three-story-controls#ExitPOIsEvent} for emitted event signatures.
     *
     * {@link https://nytimes.github.io/three-story-controls/examples/demos/path-points/ | DEMO }
     * @example
     * ```js
     *
     * const pois = [ { frame: 0 }, { frame: 54 } ....]
     * const scene = new Scene()
     * const gltfLoader = new GLTFLoader()
     * let camera, cameraRig, controls
     *
     * gltfLoader.load(cameraPath, (gltf) => {
     *  camera = gltf.cameras[0]
     *  cameraRig = new CameraRig(camera, scene)
     *  cameraRig.setAnimationClip(gltf.animations[0])
     *  cameraRig.setAnimationTime(0)
     *  controls = new PathPointsControls(cameraRig, pois)
     *  controls.enable()
     *  controls.addEventListener('ExitPOIs', (e) => {
     *    // e.exitFrom will be either 'start' or 'end'
     *  })
     *  controls.addEventListener('update', (e) => {
     *    // e.currentIndex will be the index of the starting poi
     *    // e.upcomingIndex will be the index of the upcoming poi
     *    // e.progress will be a number 0-1 indicating progress of the transition
     *  })
     * })
     * ```
     */
    class PathPointsControls extends three.EventDispatcher {
        constructor(cameraRig, pois = [], props = {}) {
            super();
            this.currentIndex = 0;
            this.upcomingIndex = null;
            this.enabled = false;
            this.cameraRig = cameraRig;
            this.pois = pois;
            Object.assign(this, defaultProps$1, props);
            this.wheelAdaptor = new WheelAdaptor({ type: 'discrete', thresholdY: this.wheelThreshold });
            this.swipeAdaptor = new SwipeAdaptor({ thresholdY: this.swipeThreshold });
            if (this.useKeyboard) {
                this.keyboardAdaptor = new KeyboardAdaptor({
                    type: 'discrete',
                    keyMapping: {
                        next: ['ArrowDown', 'ArrowRight'],
                        prev: ['ArrowUp', 'ArrowLeft'],
                    },
                });
                this.onKey = this.onKey.bind(this);
            }
            this.onCameraStart = this.onCameraStart.bind(this);
            this.onCameraUpdate = this.onCameraUpdate.bind(this);
            this.onCameraEnd = this.onCameraEnd.bind(this);
            this.onTrigger = this.onTrigger.bind(this);
        }
        getCurrentIndex() {
            return this.currentIndex;
        }
        enable() {
            if (this.useKeyboard) {
                this.keyboardAdaptor.addEventListener('trigger', this.onKey);
                this.keyboardAdaptor.connect();
            }
            this.wheelAdaptor.addEventListener('trigger', this.onTrigger);
            this.swipeAdaptor.addEventListener('trigger', this.onTrigger);
            this.cameraRig.addEventListener('CameraMoveStart', this.onCameraStart);
            this.cameraRig.addEventListener('CameraMoveUpdate', this.onCameraUpdate);
            this.cameraRig.addEventListener('CameraMoveEnd', this.onCameraEnd);
            this.wheelAdaptor.connect();
            this.swipeAdaptor.connect();
            this.enabled = true;
        }
        disable() {
            if (this.useKeyboard) {
                this.keyboardAdaptor.removeEventListener('trigger', this.onKey);
                this.keyboardAdaptor.disconnect();
            }
            this.wheelAdaptor.removeEventListener('trigger', this.onTrigger);
            this.swipeAdaptor.removeEventListener('trigger', this.onTrigger);
            this.cameraRig.removeEventListener('CameraMoveStart', this.onCameraStart);
            this.cameraRig.removeEventListener('CameraMoveUpdate', this.onCameraUpdate);
            this.cameraRig.removeEventListener('CameraMoveEnd', this.onCameraEnd);
            this.wheelAdaptor.disconnect();
            this.swipeAdaptor.disconnect();
            this.enabled = false;
        }
        update() {
            // nothing to do here
        }
        isEnabled() {
            return this.enabled;
        }
        onKey(event) {
            switch (event.trigger) {
                case 'prev':
                    this.onTrigger({ y: -1 });
                    break;
                case 'next':
                    this.onTrigger({ y: 1 });
                    break;
            }
        }
        onTrigger(event) {
            const index = this.currentIndex + event.y;
            if (index >= this.pois.length) {
                this.dispatchEvent({
                    type: 'ExitPOIs',
                    exitFrom: 'end',
                });
            }
            else if (index < 0) {
                this.dispatchEvent({
                    type: 'ExitPOIs',
                    exitFrom: 'start',
                });
            }
            else {
                this.upcomingIndex = index;
                this.cameraRig.flyToKeyframe(this.pois[this.upcomingIndex].frame, this.duration, this.ease);
            }
        }
        updatePois(progress) {
            this.dispatchEvent({
                type: 'update',
                currentIndex: this.currentIndex,
                upcomingIndex: this.upcomingIndex,
                progress,
            });
        }
        onCameraStart() {
            this.updatePois(0);
        }
        onCameraUpdate(event) {
            this.updatePois(event.progress);
        }
        onCameraEnd() {
            this.currentIndex = this.upcomingIndex;
            this.upcomingIndex = null;
        }
    }

    const defaultProps = {
        domElement: document.body,
        panFactor: Math.PI / 20,
        tiltFactor: Math.PI / 20,
        truckFactor: 1,
        pedestalFactor: 1,
        dampingFactor: 0.7,
    };
    /**
     * Control scheme for slight rotation and translation movement in response to mouse movements (designed to be used in conjunction with other control schemes)
     * @remarks
     * Note: CSS property `touch-action: none` will probably be needed on listener element
     *
     * See {@link three-story-controls#ThreeDOFControlsProps} for all properties that can be passed to the constructor.
     *
     * {@link https://nytimes.github.io/three-story-controls/examples/demos/story-points/ | DEMO w/ story points }
     *
     * {@link https://nytimes.github.io/three-story-controls/examples/demos/scroll-controls/ | DEMO w/ scroll controls}
     *
     * @example
     * ```js
     * const scene = new Scene()
     * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
     * const cameraRig = new CameraRig(camera, scene)
     * const controls = new ThreeDOFControls(cameraRig)
     *
     * controls.enable()
     *
     * // render loop
     * function animate(t) {
     *  controls.update(t)
     * }
     * ```
     */
    class ThreeDOFControls {
        constructor(cameraRig, props = {}) {
            this.enabled = false;
            this.cameraRig = cameraRig;
            Object.assign(this, defaultProps, props);
            this.pointerAdaptor = new PointerAdaptor({
                domElement: props.domElement || defaultProps.domElement,
                dampingFactor: props.dampingFactor || defaultProps.dampingFactor,
            });
            this.onPointerMove = this.onPointerMove.bind(this);
        }
        isEnabled() {
            return this.enabled;
        }
        enable() {
            this.pointerAdaptor.connect();
            this.pointerAdaptor.addEventListener('update', this.onPointerMove);
            this.enabled = true;
        }
        disable() {
            this.pointerAdaptor.disconnect();
            this.pointerAdaptor.removeEventListener('update', this.onPointerMove);
            this.enabled = false;
        }
        update(time) {
            if (this.enabled) {
                this.pointerAdaptor.update(time);
            }
        }
        onPointerMove(event) {
            if (event.pointerCount === 0) {
                this.cameraRig.do(exports.CameraAction.Pan, -event.deltas.x * this.panFactor, exports.RigComponent.Eyes);
                this.cameraRig.do(exports.CameraAction.Tilt, -event.deltas.y * this.tiltFactor, exports.RigComponent.Eyes);
                this.cameraRig.do(exports.CameraAction.Truck, event.deltas.x * this.truckFactor, exports.RigComponent.Eyes);
                this.cameraRig.do(exports.CameraAction.Pedestal, event.deltas.y * this.pedestalFactor, exports.RigComponent.Eyes);
            }
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = ".tb-ch {\n  width: 350px;\n  height: 100%;\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 99999;\n  background-color: rgba(255, 255, 255, 0.8);\n  box-sizing: border-box;\n  overflow-x: visible;\n  transition: all 0.2s ease-in-out;\n}\n  .tb-ch.collapsed {\n    left: -350px;\n  }\n  .tb-ch * {\n    box-sizing: border-box;\n  }\n  .tb-ch button {\n    text-transform: capitalize;\n    cursor: pointer;\n  }\n  .tb-ch .btn-round {\n    font-size: 1.8rem;\n    line-height: 1;\n    width: 2.5rem;\n    height: 2.5rem;\n    position: absolute;\n    right: -3rem;\n    bottom: 0.5rem;\n  }\n  .tb-ch .btn-round.collapse {\n      bottom: 3.5rem;\n    }\n  .tb-ch .controls {\n    position: absolute;\n    bottom: 0;\n    height: 225px;\n    border-top: 1px solid black;\n    padding: 0.5rem;\n    width: 100%;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n  }\n  .tb-ch .btn-text {\n    padding: 0.5rem;\n    text-align: center;\n    width: 100%;\n  }\n  .tb-ch input[type='range'] {\n    width: 100%;\n  }\n  .tb-ch .pois {\n    height: calc(100vh - 225px - 1rem);\n    overflow: scroll;\n    padding: 1rem 1rem 0;\n  }\n  .tb-ch .poi {\n    margin-bottom: 1rem;\n  }\n  .tb-ch .poi h2 {\n      font-size: 1rem;\n    }\n  .tb-ch .poi .wrapper {\n      display: flex;\n      flex-direction: row;\n    }\n  .tb-ch .poi img {\n      display: block;\n      max-width: 100%;\n      min-width: 0;\n      margin-right: 0.5rem;\n    }\n  .tb-ch .poi .poi-controls {\n      display: flex;\n      flex-direction: column;\n    }\n  .tb-ch .poi .poi-controls button {\n        padding: 0.5rem;\n        width: 2rem;\n        height: 2rem;\n        margin-bottom: 0.25rem;\n      }\n  .tb-ch .poi .poi-params {\n      display: flex;\n      flex-direction: row;\n      flex-wrap: wrap;\n      width: calc(100% - 2.5rem);\n    }\n  .tb-ch .poi label,\n    .tb-ch .poi input,\n    .tb-ch .poi select {\n      width: 50%;\n      font-size: 0.7rem;\n      font-family: monospace;\n      margin: 0.25rem 0;\n    }\n  .tb-ch .poi input {\n      text-align: center;\n    }\n";
    styleInject(css_248z);

    const easeFunctions = ['none', 'power1', 'power2', 'power3', 'power4', 'sine', 'expo', 'circ'];
    const DOMClass = {
        visit: 'visit',
        remove: 'remove',
        duration: 'duration',
        ease: 'ease',
        moveUp: 'move-up',
        moveDown: 'move-down',
    };
    /**
     * A helper tool for creating camera animation paths and/or choosing camera look-at positions for points of interest in a scene
     *
     * @remarks
     * A helper tool for creating camera animation paths and/or choosing camera look-at positions for points of interest in a scene.
     *
     * The `CameraHelper` can be set up with any scene along with {@link three-story-controls#FreeMovementControls | FreeMovementControls}.
     *
     * It renders as an overlay with functionality to add/remove/reorders points of interest, and create an animation path between them.
     *  Each saved camera position is displayed with an image on the `CameraHelper` panel.
     *
     * The data can be exported as a JSON file that can then be used with different control schemes.
     *
     * {@link https://nytimes.github.io/three-story-controls/examples/demos/camera-helper | DEMO }
     *
     * @example
     * Here's an example of initializing the CameraHelper
     * ```js
     * const scene = new Scene()
     * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
     * const cameraRig = new CameraRig(camera, scene)
     * const controls = new FreeMovementControls(cameraRig)
     *
     * controls.enable()
     *
     * const cameraHelper = new CameraHelper(rig, controls, renderer.domElement)
     *
     * // Render loop
     * // To allow for capturing an image of the canvas,
     * // it's important to update the CameraHelper after the scene is rendered,
     * // but before requesting the animation frame
     * function render(t) {
     *   controls.update(t)
     *   renderer.render(scene, camera)
     *   cameraHelper.update(t)
     *   window.requestAnimationFrame(render)
     * }
     *
     * render()
     * ```
     *
     *
     *
     * The following examples demonstrate using the exported data. Note: Depending on your setup, you may need to change the .json extension to .js and prepend the text with `export default` such that you can import it as javascript
     *
     * @example
     * Here's an example using the exported JSON data with ScrollControls.
     * ```javascript
     * import * as cameraData from 'camera-control.json'
     * const scene = new Scene()
     * const gltfLoader = new GLTFLoader()
     * const camera = new PerspectiveCamera()
     * const cameraRig = new CameraRig(camera, scene)
     *
     * // Parse the JSON animation clip
     * cameraRig.setAnimationClip(AnimationClip.parse(cameraData.animationClip))
     * cameraRig.setAnimationTime(0)
     *
     * const controls = new ScrollControls(cameraRig, {
     *  scrollElement: document.querySelector('.scroller'),
     * })
     *
     * controls.enable()
     *
     * function render(t) {
     *   window.requestAnimationFrame(render)
     *   if (rig.hasAnimation) {
     *     controls.update(t)
     *   }
     *   renderer.render(scene, camera)
     * }
     * ```
     *
     * @example
     * Here's an example using the exported data with Story Point controls
     * ```javascript
     * import * as cameraData from 'camera-control.json'
     * const scene = new Scene()
     * const gltfLoader = new GLTFLoader()
     * const camera = new PerspectiveCamera()
     * const cameraRig = new CameraRig(camera, scene)
     *
     * // Format the exported data to create three.js Vector and Quaternions
     * const pois = cameraData.pois.map((poi, i) => {
     *   return {
     *     position: new Vector3(...poi.position),
     *     quaternion: new Quaternion(...poi.quaternion),
     *     duration: poi.duration,
     *     ease: poi.ease,
     *   }
     * })
     *
     * const controls = new StoryPointsControls(rig, pois)
     * controls.enable()
     *
     * function render(t) {
     *   window.requestAnimationFrame(render)
     *   controls.update(t)
     *   renderer.render(scene, camera)
     * }
     * ```
     */
    class CameraHelper {
        constructor(rig, controls, canvas, canvasParent) {
            this.useSlerp = true;
            this.rig = rig;
            this.controls = controls;
            this.canvas = canvas;
            this.pois = [];
            this.currentIndex = null;
            this.doCapture = false;
            this.isPlaying = false;
            this.initUI(canvasParent);
        }
        capture() {
            this.doCapture = true;
        }
        update(time) {
            if (this.doCapture) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 640;
                canvas.height = 360;
                ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height);
                const image = canvas.toDataURL();
                this.addPoi(image);
                this.doCapture = false;
            }
            if (this.isPlaying) {
                if (!this.playStartTime) {
                    this.playStartTime = time;
                    this.controls.disable();
                    this.rig.packTransform();
                }
                const t = (time - this.playStartTime) / 1000;
                this.rig.setAnimationTime(t);
                if (t > this.animationClip.duration) {
                    this.isPlaying = false;
                    this.playStartTime = null;
                    this.controls.enable();
                    this.rig.unpackTransform();
                }
            }
        }
        addPoi(image) {
            this.pois.push(Object.assign(Object.assign({}, this.rig.getWorldCoordinates()), { duration: 1, ease: 'power1', image }));
            this.currentIndex = this.pois.length - 1;
            this.createClip();
            this.render();
        }
        updatePoi(index, props) {
            this.pois[index] = Object.assign(Object.assign({}, this.pois[index]), props);
        }
        movePoi(index, direction) {
            if (index + direction >= 0 && index + direction < this.pois.length) {
                const temp = this.pois[index];
                this.pois[index] = this.pois[index + direction];
                this.pois[index + direction] = temp;
                this.render();
            }
        }
        removePoi(index) {
            this.pois.splice(index, 1);
            this.render();
        }
        goToPoi(index) {
            const poi = this.pois[index];
            this.rig.flyTo(poi.position, poi.quaternion, poi.duration, poi.ease, this.useSlerp);
        }
        createClip() {
            if (this.pois.length > 0) {
                const times = [];
                const positionValues = [];
                const quaternionValues = [];
                const tmpPosition = new three.Vector3();
                const tmpQuaternion = new three.Quaternion();
                const framesPerPoi = 10;
                let tweenStartTime = 0;
                // transform imported arrays to quaternions and vector3 when loading a camera file
                if (!this.pois[0].quaternion.isQuaternion && !this.pois[0].position.isVector3) {
                    for (let i = 0; i < this.pois.length; i++) {
                        const p = this.pois[i];
                        p.quaternion = new three.Quaternion(p.quaternion[0], p.quaternion[1], p.quaternion[2], p.quaternion[3]);
                        p.position = new three.Vector3(p.position[0], p.position[1], p.position[2]);
                    }
                }
                for (let i = 0; i < this.pois.length - 1; i++) {
                    const p1 = this.pois[i];
                    const p2 = this.pois[i + 1];
                    const values = {
                        px: p1.position.x,
                        py: p1.position.y,
                        pz: p1.position.z,
                        qx: p1.quaternion.x,
                        qy: p1.quaternion.y,
                        qz: p1.quaternion.z,
                        qw: p1.quaternion.w,
                        slerpAmount: 0,
                    };
                    const target = {
                        px: p2.position.x,
                        py: p2.position.y,
                        pz: p2.position.z,
                        qx: p2.quaternion.x,
                        qy: p2.quaternion.y,
                        qz: p2.quaternion.z,
                        qw: p2.quaternion.w,
                        slerpAmount: 1,
                        duration: p2.duration,
                        ease: p2.ease,
                    };
                    const tween = gsap__default['default'].to(values, target);
                    for (let j = 0; j < framesPerPoi; j++) {
                        const lerpAmount = p2.duration * (j / framesPerPoi);
                        times.push(tweenStartTime + lerpAmount);
                        tween.seek(lerpAmount);
                        if (this.useSlerp) {
                            tmpQuaternion.slerpQuaternions(p1.quaternion, p2.quaternion, values.slerpAmount);
                        }
                        else {
                            tmpQuaternion.set(values.qx, values.qy, values.qz, values.qw);
                        }
                        tmpPosition.set(values.px, values.py, values.pz);
                        tmpQuaternion.toArray(quaternionValues, quaternionValues.length);
                        tmpPosition.toArray(positionValues, positionValues.length);
                    }
                    tweenStartTime += p2.duration;
                }
                // add last point
                const last = this.pois[this.pois.length - 1];
                last.quaternion.toArray(quaternionValues, quaternionValues.length);
                last.position.toArray(positionValues, positionValues.length);
                times.push(tweenStartTime);
                this.animationClip = new three.AnimationClip(null, tweenStartTime, [
                    new three.VectorKeyframeTrack('Translation.position', times, positionValues),
                    new three.QuaternionKeyframeTrack('Rotation.quaternion', times, quaternionValues),
                ]);
                this.rig.setAnimationClip(this.animationClip);
            }
        }
        scrubClip(amount) {
            if (this.pois.length > 0) {
                this.rig.setAnimationPercentage(amount);
            }
        }
        playClip() {
            if (this.pois.length > 0) {
                this.isPlaying = true;
            }
        }
        import() {
            if (this.fileInput) {
                this.fileInput.click();
                const reader = new FileReader();
                this.fileInput.onchange = () => {
                    reader.readAsText(this.fileInput.files[0]);
                    reader.onload = (e) => {
                        const parsed = JSON.parse(e.target.result);
                        this.pois = parsed.pois;
                        this.animationClip = parsed.animationClip;
                        this.createClip();
                        this.render();
                    };
                };
            }
        }
        export({ draft }) {
            if (this.pois.length > 0) {
                const jsondata = {};
                jsondata.pois = this.pois.map((poi) => {
                    const position = [poi.position.x, poi.position.y, poi.position.z];
                    const quaternion = [poi.quaternion.x, poi.quaternion.y, poi.quaternion.z, poi.quaternion.w];
                    const obj = {
                        position,
                        quaternion,
                        duration: poi.duration,
                        ease: poi.ease,
                    };
                    if (draft) {
                        obj.image = poi.image;
                    }
                    return obj;
                });
                if (this.animationClip) {
                    jsondata.animationClip = three.AnimationClip.toJSON(this.animationClip);
                }
                const data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsondata));
                const a = document.createElement('a');
                a.href = 'data:' + data;
                a.download = `camera-data${draft ? '-draft' : ''}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        }
        exportImages() {
            const link = document.createElement('a');
            document.body.appendChild(link);
            this.pois.forEach((poi, index) => {
                link.href = poi.image;
                link.download = `camera-poi-${index}.png`;
                link.click();
            });
            link.remove();
        }
        // ui
        initUI(canvasParent) {
            this.drawer = document.createElement('div');
            this.drawer.classList.add('tb-ch');
            const btnAdd = document.createElement('button');
            btnAdd.classList.add('btn-round', 'add');
            btnAdd.innerText = '+';
            btnAdd.onclick = this.capture.bind(this);
            this.collapseBtn = document.createElement('button');
            this.collapseBtn.classList.add('btn-round', 'collapse');
            this.collapseBtn.innerText = '<';
            this.collapseBtn.onclick = this.collapse.bind(this);
            const controlWrapper = document.createElement('div');
            controlWrapper.classList.add('controls');
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.id = 'import';
            this.fileInput.accept = 'application/json';
            this.fileInput.style.display = 'none';
            this.btnImport = document.createElement('button');
            this.btnImport.classList.add('btn-text', 'import');
            this.btnImport.innerText = 'import draft JSON';
            this.btnImport.onclick = this.import.bind(this);
            const btnExportImages = document.createElement('button');
            btnExportImages.classList.add('btn-text', 'export');
            btnExportImages.innerText = 'export draft JSON';
            btnExportImages.onclick = this.export.bind(this, { draft: true });
            const btnExport = document.createElement('button');
            btnExport.classList.add('btn-text', 'export');
            btnExport.innerText = 'export production JSON';
            btnExport.onclick = this.export.bind(this, { draft: false });
            const bntExportImages = document.createElement('button');
            bntExportImages.classList.add('btn-text', 'export-images');
            bntExportImages.innerHTML = 'export images';
            bntExportImages.onclick = this.exportImages.bind(this);
            const btnPlay = document.createElement('button');
            btnPlay.classList.add('btn-text', 'play');
            btnPlay.innerText = 'play';
            btnPlay.onclick = this.playClip.bind(this);
            const sliderTime = document.createElement('input');
            sliderTime.type = 'range';
            sliderTime.min = '0';
            sliderTime.max = '1000';
            sliderTime.step = '0.1';
            sliderTime.value = '0';
            const updateTime = this.scrubClip.bind(this);
            sliderTime.onmousedown = () => this.rig.packTransform();
            sliderTime.onmouseup = () => this.rig.unpackTransform();
            sliderTime.oninput = (e) => updateTime(parseInt(e.target.value) / 1000);
            this.domList = document.createElement('div');
            this.domList.classList.add('pois');
            this.domList.onclick = this.handleEvents.bind(this);
            this.domList.onchange = this.handleEvents.bind(this);
            controlWrapper.append(this.fileInput, this.btnImport, btnPlay, sliderTime, bntExportImages, btnExportImages, btnExport);
            this.drawer.append(btnAdd, this.collapseBtn, this.domList, controlWrapper);
            const parent = canvasParent || document.body;
            parent.append(this.drawer);
        }
        handleEvents(event) {
            const index = event.target.dataset.index;
            if (index) {
                if (event.target.classList.contains(DOMClass.visit)) {
                    this.goToPoi(parseInt(index));
                }
                else if (event.target.classList.contains(DOMClass.remove)) {
                    this.removePoi(parseInt(index));
                }
                else if (event.target.classList.contains(DOMClass.duration)) {
                    this.updatePoi(parseInt(index), { duration: parseFloat(event.target.value) });
                }
                else if (event.target.classList.contains(DOMClass.ease)) {
                    this.updatePoi(parseInt(index), { ease: event.target.value });
                }
                else if (event.target.classList.contains(DOMClass.moveUp)) {
                    this.movePoi(parseInt(index), -1);
                }
                else if (event.target.classList.contains(DOMClass.moveDown)) {
                    this.movePoi(parseInt(index), 1);
                }
                this.createClip();
            }
        }
        collapse() {
            if (this.drawer.classList.contains('collapsed')) {
                this.drawer.classList.remove('collapsed');
                this.collapseBtn.innerText = '<';
            }
            else {
                this.drawer.classList.add('collapsed');
                this.collapseBtn.innerText = '>';
            }
        }
        render() {
            this.domList.innerHTML = '';
            this.pois.forEach((poi, index) => {
                const div = document.createElement('div');
                div.classList.add('poi');
                const textHeading = document.createElement('h2');
                textHeading.innerText = `${index + 1}.`;
                const wrapper = document.createElement('div');
                wrapper.classList.add('wrapper');
                const controls = document.createElement('div');
                controls.classList.add('poi-controls');
                const params = document.createElement('div');
                params.classList.add('poi-params');
                const image = new Image();
                image.src = poi.image;
                const labelDuration = document.createElement('label');
                labelDuration.innerText = 'Duration';
                const inputDuration = document.createElement('input');
                inputDuration.classList.add(DOMClass.duration);
                inputDuration.dataset.index = `${index}`;
                inputDuration.type = 'number';
                inputDuration.value = String(poi.duration);
                const labelEase = document.createElement('label');
                labelEase.innerText = 'Easing';
                const selectEase = document.createElement('select');
                selectEase.classList.add(DOMClass.ease);
                selectEase.dataset.index = `${index}`;
                const options = easeFunctions.map((x) => {
                    const op = document.createElement('option');
                    op.innerText = x;
                    op.value = x;
                    op.selected = x === poi.ease;
                    return op;
                });
                selectEase.append(...options);
                const btnRemove = document.createElement('button');
                btnRemove.classList.add(DOMClass.remove);
                btnRemove.title = 'Remove';
                btnRemove.dataset.index = `${index}`;
                btnRemove.innerText = 'x';
                const btnVisit = document.createElement('button');
                btnVisit.classList.add(DOMClass.visit);
                btnVisit.title = 'Visit';
                btnVisit.dataset.index = `${index}`;
                btnVisit.innerHTML = '&rarr;';
                const btnMoveUp = document.createElement('button');
                btnMoveUp.classList.add(DOMClass.moveUp);
                btnMoveUp.title = 'Move up';
                btnMoveUp.dataset.index = `${index}`;
                btnMoveUp.innerHTML = '&uarr;';
                const btnMoveDown = document.createElement('button');
                btnMoveDown.classList.add(DOMClass.moveDown);
                btnMoveDown.title = 'Move down';
                btnMoveDown.dataset.index = `${index}`;
                btnMoveDown.innerHTML = '&darr;';
                controls.append(btnRemove, btnVisit, btnMoveUp, btnMoveDown);
                params.append(labelDuration, inputDuration, labelEase, selectEase);
                wrapper.append(image, controls);
                div.append(textHeading, wrapper, params);
                this.domList.appendChild(div);
            });
        }
    }

    exports.BaseAdaptor = BaseAdaptor;
    exports.CameraHelper = CameraHelper;
    exports.CameraRig = CameraRig;
    exports.Damper = Damper;
    exports.FreeMovementControls = FreeMovementControls;
    exports.KeyboardAdaptor = KeyboardAdaptor;
    exports.PathPointsControls = PathPointsControls;
    exports.PointerAdaptor = PointerAdaptor;
    exports.ScrollAdaptor = ScrollAdaptor;
    exports.ScrollControls = ScrollControls;
    exports.StoryPointsControls = StoryPointsControls;
    exports.SwipeAdaptor = SwipeAdaptor;
    exports.ThreeDOFControls = ThreeDOFControls;
    exports.WheelAdaptor = WheelAdaptor;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=three-story-controls.js.map
