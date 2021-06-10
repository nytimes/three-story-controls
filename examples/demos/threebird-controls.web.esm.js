import { Object3D, AnimationMixer, PerspectiveCamera, Vector3, Quaternion, EventDispatcher } from 'https://cdn.skypack.dev/three@0.122.0';
import { TweenMax } from 'https://cdn.skypack.dev/gsap@3.6.1';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

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
var Damper = /** @class */ (function () {
    function Damper(props) {
        this.epsilon = 0.001;
        this.values = {};
        this.targetValues = {};
        this.deltaValues = {};
        Object.assign(this.values, props.values);
        Object.assign(this.targetValues, props.values);
        this.deltaValues = {};
        for (var key in this.values) {
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
    Damper.prototype.update = function () {
        var deltas = {};
        var approached = true;
        for (var key in this.values) {
            deltas[key] = this.targetValues[key] - this.values[key];
            approached = approached && Math.abs(deltas[key]) < this.epsilon;
        }
        if (approached) {
            for (var key in this.values) {
                this.deltaValues[key] = deltas[key];
                this.values[key] = this.targetValues[key];
            }
            this.hasReached = true;
        }
        else {
            for (var key in this.values) {
                this.deltaValues[key] = this.dampingFactor * deltas[key];
                this.values[key] += this.deltaValues[key];
            }
        }
    };
    /**
     * @param target DamperValues the damper needs to approach
     */
    Damper.prototype.setTarget = function (target) {
        for (var key in target) {
            this.targetValues[key] = target[key];
        }
        this.hasReached = false;
    };
    /**
     * Increment/Decrement a specifc damper target value
     * @param key The key of the value to modify
     * @param value The amount to modify the target by
     */
    Damper.prototype.addToTarget = function (key, value) {
        this.targetValues[key] += value;
        this.hasReached = false;
    };
    /**
     * @param value Number to reset all damper values to
     */
    Damper.prototype.resetAll = function (value) {
        for (var key in this.values) {
            this.targetValues[key] = value;
            this.values[key] = value;
            this.deltaValues[key] = 0;
        }
        this.hasReached = true;
    };
    /**
     * Reset damper values as described by the given DamperValues object
     * @param values DamperValues object to reset the damper to
     */
    Damper.prototype.resetData = function (values) {
        for (var key in values) {
            this.targetValues[key] = values[key];
            this.values[key] = values[key];
            this.deltaValues[key] = 0;
        }
        this.hasReached = true;
    };
    /**
     * @returns DamperValues object with the current values of the damper
     */
    Damper.prototype.getCurrentValues = function () {
        return __assign({}, this.values);
    };
    /**
     * @returns DamperValues object with the amount the values changed since the last `update()` call
     */
    Damper.prototype.getDeltaValues = function () {
        return __assign({}, this.deltaValues);
    };
    /**
     * @returns Whether the damper has reached its target (within permissible error range)
     */
    Damper.prototype.reachedTarget = function () {
        return this.hasReached;
    };
    return Damper;
}());

var _a, _b, _c, _d;
var CameraAction;
(function (CameraAction) {
    CameraAction["Pan"] = "Pan";
    CameraAction["Tilt"] = "Tilt";
    CameraAction["Roll"] = "Roll";
    CameraAction["Truck"] = "Truck";
    CameraAction["Pedestal"] = "Pedestal";
    CameraAction["Dolly"] = "Dolly";
    CameraAction["LocalTruck"] = "LocalTruck";
    CameraAction["LocalPedestal"] = "LocalPedestal";
    CameraAction["LocalDolly"] = "LocalDolly";
    CameraAction["Zoom"] = "Zoom";
    /* TODO "Orbit" = "Orbit" */
})(CameraAction || (CameraAction = {}));
var Axis;
(function (Axis) {
    Axis["X"] = "X";
    Axis["Y"] = "Y";
    Axis["Z"] = "Z";
})(Axis || (Axis = {}));
var ActionMappingByUpAxis = (_a = {},
    _a[Axis.X] = (_b = {},
        _b[CameraAction.Pan] = Axis.X,
        _b[CameraAction.Tilt] = Axis.Z,
        _b[CameraAction.Roll] = Axis.Y,
        _b),
    _a[Axis.Y] = (_c = {},
        _c[CameraAction.Pan] = Axis.Y,
        _c[CameraAction.Tilt] = Axis.X,
        _c[CameraAction.Roll] = Axis.Z,
        _c),
    _a[Axis.Z] = (_d = {},
        _d[CameraAction.Pan] = Axis.Z,
        _d[CameraAction.Tilt] = Axis.X,
        _d[CameraAction.Roll] = Axis.Y,
        _d),
    _a);
/**
 * The CameraRig holds the camera, and can respond to actions such as Pan/Tilt/Dolly etc. It can also be controlled along a given path (in the form of an `AnimationClip`), or tweened to specified points.
 *
 * @remarks
 * The rig is made of 5 objects and a camera
 * A translation box with default name 'Translation',
 * A rotation box with default name 'Rotation',
 * with 3 nested objects (rotation components) -
 * each responsible for rotation around 1 axis
 *
 * The naming of 'Translation' and 'Rotation' is to ensure the rig naming
 * matches that of an animation clip, if provided -- making it trivial to
 * switch in and out of using an animation clip. These names can be
 * provided in the constructor props - to match the setup of the 3d tool used to
 * create the animation
 *
 * The camera actions Pan/Tilt/Roll control the inner rotation components,
 * not the rotation box. This allows for a seperation of a 'base' rotation
 * if needed (for example, the animation clip only controls the rotation box,
 * so the inner components are free to rotate anchored at this base. Similarly, moving
 * the rig to a specific position/orientation sets the rotation of the box,
 * leaving the components to control 3dof)
 *
 * The order of rotation is dependant on the current Up axis
 * Instead of having to remember the order, and keep track of axes visually,
 * Each axis is labelled by a camera action - Pan, Tilt, and Roll
 * When the Up axis is Y, for example, the Pan axis is Y, Tilt is X, and Roll is Z
 * Similarly, this is defined for the other possible Up axes
 * The order of rotation (and object nesting) is always Pan - Tilt - Roll
 *
 * Additionaly, it can be specified if the rig should be translated along
 * the current rotation direction any of the axes.
 * The default is to translate along the Pan axis (Y default), ie the rig will
 * move forward/backward in the direction the camera is panned to.
 *
 * The camera actions concerned with translation are Truck/Pedestal/Dolly
 * Again, instead of specifying x/y/z axes,
 * Truck is translation on the Tilt axis
 * Pedestal is translation on the Pan axis
 * and Dolly is translation on the Roll axis
 *
 * For 3dof controls, there are additional translate actions called
 * LocalTruck / LocalPedestal / LocalDolly
 * These will translate the inner rotation components, and perhaps
 * should not be used when creating 6dof controls.
 */
var CameraRig = /** @class */ (function (_super) {
    __extends(CameraRig, _super);
    // Constructor
    function CameraRig(camera, scene, props) {
        var _a;
        if (props === void 0) { props = {}; }
        var _this = _super.call(this) || this;
        _this.inTransit = false;
        // private preventActionsWhileTransitioning = true
        _this.upAxis = Axis.Y;
        _this.actionAxes = ActionMappingByUpAxis[_this.upAxis];
        _this.hasAnimation = false;
        _this.animationTranslationObjectName = 'Translation';
        _this.animationRotationObjectName = 'Rotation';
        _this.respondsToActions = true;
        // is this needed or should translation always occur along the Pan axis?
        _this.translateAlong = (_a = {},
            _a[CameraAction.Tilt] = false,
            _a[CameraAction.Pan] = true,
            _a[CameraAction.Roll] = false,
            _a);
        _this.camera = camera;
        _this.scene = scene;
        Object.assign(_this, props);
        _this.initRig();
        return _this;
    }
    CameraRig.prototype.initRig = function () {
        var _a;
        this.translationBox = new Object3D();
        this.rotationBox = new Object3D();
        this.rotationElements = (_a = {},
            _a[Axis.X] = new Object3D(),
            _a[Axis.Y] = new Object3D(),
            _a[Axis.Z] = new Object3D(),
            _a);
        this.rotationBox.name = this.animationRotationObjectName;
        this.translationBox.name = this.animationTranslationObjectName;
        this.translationBox.rotation.order = this.getRotationOrder();
        var first = this.rotationElements[this.actionAxes[CameraAction.Pan]];
        var second = this.rotationElements[this.actionAxes[CameraAction.Tilt]];
        var third = this.rotationElements[this.actionAxes[CameraAction.Roll]];
        this.scene.add(this.translationBox.add(this.rotationBox.add(first.add(second.add(third.add(this.camera))))));
        this.cameraIsInRig = true;
    };
    // rotate component on axis by degrees
    CameraRig.prototype.rotateRigComponent = function (rigComponent, axis, degrees) {
        switch (axis) {
            case Axis.X:
                rigComponent.rotateX(degrees);
                break;
            case Axis.Y:
                rigComponent.rotateY(degrees);
                break;
            case Axis.Z:
                rigComponent.rotateZ(degrees);
                break;
        }
    };
    // rotate degrees for given camera action
    CameraRig.prototype.rotate = function (action, degrees) {
        var axis = this.actionAxes[action];
        if (this.translateAlong[action]) {
            this.rotateRigComponent(this.translationBox, axis, degrees);
        }
        else {
            this.rotateRigComponent(this.rotationElements[axis], axis, degrees);
        }
    };
    // translate on axis by amount
    CameraRig.prototype.translateRigComponent = function (rigComponent, axis, amount) {
        switch (axis) {
            case Axis.X:
                rigComponent.translateX(amount);
                break;
            case Axis.Y:
                rigComponent.translateY(amount);
                break;
            case Axis.Z:
                rigComponent.translateZ(amount);
                break;
        }
    };
    /**
     * Set an animation clip for the rig
     * @param {AnimationClip} clip - AnimationClip containing a VectorKeyFrameTrack for position and a QuaternionKeyFrameTrack for rotation
     * @param {string} translationObjectName - Name of translation object
     * @param {string} rotationObjectName -  Name of rotation object
     */
    CameraRig.prototype.setAnimationClip = function (clip, translationObjectName, rotationObjectName) {
        this.animationClip = clip;
        if (translationObjectName)
            this.animationTranslationObjectName = translationObjectName;
        if (rotationObjectName)
            this.animationRotationObjectName = rotationObjectName;
        this.hasAnimation = true;
        this.mixer = new AnimationMixer(this.translationBox);
        var action = this.mixer.clipAction(this.animationClip);
        action.play();
        this.mixer.setTime(0);
    };
    /**
     * Main method for controlling the camera
     * @param action - Action to perform
     * @param amount - Amount to move/rotate/etc
     */
    CameraRig.prototype.do = function (action, amount) {
        if (this.respondsToActions) {
            switch (action) {
                case CameraAction.Pan:
                case CameraAction.Tilt:
                case CameraAction.Roll:
                    this.rotate(action, amount);
                    break;
                case CameraAction.Truck:
                    this.translateRigComponent(this.translationBox, this.actionAxes[CameraAction.Tilt], amount);
                    break;
                case CameraAction.Pedestal:
                    this.translateRigComponent(this.translationBox, this.actionAxes[CameraAction.Pan], amount);
                    break;
                case CameraAction.Dolly:
                    this.translateRigComponent(this.translationBox, this.actionAxes[CameraAction.Roll], amount);
                    break;
                case CameraAction.LocalTruck:
                    {
                        var axis = this.actionAxes[CameraAction.Tilt];
                        this.translateRigComponent(this.rotationElements[axis], axis, amount);
                    }
                    break;
                case CameraAction.LocalPedestal:
                    {
                        var axis = this.actionAxes[CameraAction.Pan];
                        this.translateRigComponent(this.rotationElements[axis], axis, amount);
                    }
                    break;
                case CameraAction.LocalDolly:
                    {
                        var axis = this.actionAxes[CameraAction.Roll];
                        this.translateRigComponent(this.rotationElements[axis], axis, amount);
                    }
                    break;
                case CameraAction.Zoom:
                    if (this.camera instanceof PerspectiveCamera) {
                        this.camera.fov = amount;
                        this.camera.updateProjectionMatrix();
                    }
                    break;
            }
        }
    };
    // TODO: add 'unpackTransform', change freeze to 'pack'
    /**
     * Packs transfrom into parent translation and rotation elements,
     * and 0s out transforms for all inner elements. Useful to use before
     * procedural animation on world position and quaternion
     */
    CameraRig.prototype.freezeTransform = function () {
        var _a = this.getWorldCoordinates(), position = _a.position, quaternion = _a.quaternion;
        this.translationBox.position.copy(position);
        this.translationBox.rotation.set(0, 0, 0);
        this.rotationBox.quaternion.copy(quaternion);
        this.rotationBox.position.set(0, 0, 0);
        for (var key in this.rotationElements) {
            this.rotationElements[key].position.set(0, 0, 0);
            this.rotationElements[key].rotation.set(0, 0, 0);
        }
    };
    /**
     * Disassemble the camera from the rig and attach it to the scene.
     * Useful if one needs to set the camera's world position or
     * control it outside of the rig setup
     */
    CameraRig.prototype.disassemble = function () {
        if (this.cameraIsInRig) {
            this.scene.attach(this.camera);
            this.cameraIsInRig = false;
        }
    };
    /**
     * Place the camera back in the rig
     */
    // TODO: rethink freeze/unfreeze and assemble/disassemble transforms
    CameraRig.prototype.assemble = function () {
        if (!this.cameraIsInRig) {
            var _a = this.getWorldCoordinates(), position = _a.position, quaternion = _a.quaternion;
            this.translationBox.position.copy(position);
            this.rotationBox.quaternion.copy(quaternion);
            this.rotationElements[this.actionAxes[CameraAction.Roll]].attach(this.camera);
            this.cameraIsInRig = true;
        }
    };
    /**
     * @returns Whether the camera is attached to the rig
     */
    CameraRig.prototype.isInRig = function () {
        return this.cameraIsInRig;
    };
    /**
     * Get the rotaion order as a string compatible with what three.js uses
     */
    CameraRig.prototype.getRotationOrder = function () {
        return Object.values(this.actionAxes).join('');
    };
    /**
     * Get world position and orientation of the camera
     */
    CameraRig.prototype.getWorldCoordinates = function () {
        var position = new Vector3();
        this.camera.getWorldPosition(position);
        var quaternion = new Quaternion();
        this.camera.getWorldQuaternion(quaternion);
        return { position: position, quaternion: quaternion };
    };
    /**
     * If the camera is in the middle of a transition
     */
    CameraRig.prototype.isMoving = function () {
        return this.inTransit;
    };
    /**
     * Set the Up axis for the camera, adjusting the rotation components accordingly
     * to maintain consistent Pan/Tilt/Roll behaviour
     * ... might not be necessary, rotationBox transforms could take care of setting context
     * @param axis - New Up axis
     */
    CameraRig.prototype.setUpAxis = function (axis) {
        var currentAxes = this.actionAxes;
        this.upAxis = axis;
        this.actionAxes = ActionMappingByUpAxis[this.upAxis];
        var currentPanObject = this.rotationElements[currentAxes[CameraAction.Pan]];
        var currentTiltObject = this.rotationElements[currentAxes[CameraAction.Tilt]];
        var currentRollObject = this.rotationElements[currentAxes[CameraAction.Roll]];
        // reassign objects to retain nesting
        this.rotationElements[this.actionAxes[CameraAction.Pan]] = currentPanObject;
        this.rotationElements[this.actionAxes[CameraAction.Tilt]] = currentTiltObject;
        this.rotationElements[this.actionAxes[CameraAction.Roll]] = currentRollObject;
        this.translationBox.rotation.order = this.getRotationOrder();
    };
    /**
     * Transition to a specific position and orientation in world space.
     * All inner rotation components will be reset to 0 as a result of this.
     * @param position
     * @param quaternion
     * @param duration
     * @param ease
     */
    CameraRig.prototype.flyTo = function (position, quaternion, duration, ease) {
        var _this = this;
        if (duration === void 0) { duration = 1; }
        if (ease === void 0) { ease = 'power1'; }
        if (!this.isMoving()) {
            var currentCoords = this.getWorldCoordinates();
            var currentValues_1 = {
                px: currentCoords.position.x,
                py: currentCoords.position.y,
                pz: currentCoords.position.z,
                qx: currentCoords.quaternion.x,
                qy: currentCoords.quaternion.y,
                qz: currentCoords.quaternion.z,
                qw: currentCoords.quaternion.w,
            };
            var targetValues = {
                px: position.x,
                py: position.y,
                pz: position.z,
                qx: quaternion.x,
                qy: quaternion.y,
                qz: quaternion.z,
                qw: quaternion.w,
            };
            var onStart = function () {
                _this.inTransit = true;
                _this.disassemble();
                _this.dispatchEvent({ type: 'CameraMoveStart' });
            };
            var onUpdate_1 = function (tween) {
                _this.camera.position.set(currentValues_1.px, currentValues_1.py, currentValues_1.pz);
                _this.camera.quaternion.set(currentValues_1.qx, currentValues_1.qy, currentValues_1.qz, currentValues_1.qw);
                _this.dispatchEvent({
                    type: 'CameraMoveUpdate',
                    progress: tween.progress(),
                });
            };
            var onComplete = function () {
                _this.assemble();
                _this.inTransit = false;
                _this.dispatchEvent({ type: 'CameraMoveEnd' });
            };
            TweenMax.to(currentValues_1, __assign(__assign({ duration: duration,
                ease: ease }, targetValues), { onStart: onStart, onUpdate: function () {
                    onUpdate_1(this);
                }, onComplete: onComplete }));
        }
    };
    /**
     * Transition to a specific keyframe on the animation clip
     * All inner rotation components will be reset to 0 as a result of this.
     * @param frame - frame
     * @param duration - duration
     * @param ease - ease
     */
    CameraRig.prototype.flyToKeyframe = function (frame, duration, ease) {
        var _this = this;
        if (duration === void 0) { duration = 1; }
        if (ease === void 0) { ease = 'power1'; }
        if (this.hasAnimation && !this.isMoving()) {
            var currentValues_2 = {
                time: this.mixer.time,
            };
            var targetValues = {
                time: this.animationClip.tracks[0].times[frame],
            };
            var onStart = function () {
                _this.inTransit = true;
                _this.dispatchEvent({ type: 'CameraMoveStart' });
            };
            var onUpdate_2 = function (tween) {
                _this.mixer.setTime(currentValues_2.time);
                _this.dispatchEvent({
                    type: 'CameraMoveUpdate',
                    progress: tween.progress(),
                });
            };
            var onComplete = function () {
                _this.inTransit = false;
                _this.dispatchEvent({ type: 'CameraMoveEnd' });
            };
            TweenMax.to(currentValues_2, __assign(__assign({ duration: duration,
                ease: ease }, targetValues), { onStart: onStart, onUpdate: function () {
                    onUpdate_2(this);
                }, onComplete: onComplete }));
        }
    };
    /**
     * @param percentage - percentage of animation clip to move to, between 0 and 1
     */
    CameraRig.prototype.setAnimationPercentage = function (percentage) {
        if (this.hasAnimation) {
            var percent = Math.max(0, Math.min(percentage * this.animationClip.duration, this.animationClip.duration - 0.0001));
            this.mixer.setTime(percent);
        }
    };
    /**
     * @param time - timestamp of animation clip to move to
     */
    CameraRig.prototype.setAnimationTime = function (time) {
        if (this.hasAnimation)
            this.mixer.setTime(time);
    };
    /**
     * @param frame - frame of animation clip to move to
     */
    CameraRig.prototype.setAnimationKeyframe = function (frame) {
        if (this.hasAnimation)
            this.mixer.setTime(this.animationClip.tracks[0].times[frame]);
    };
    return CameraRig;
}(EventDispatcher));

var BaseAdaptor = /** @class */ (function (_super) {
    __extends(BaseAdaptor, _super);
    function BaseAdaptor() {
        return _super.call(this) || this;
    }
    return BaseAdaptor;
}(EventDispatcher));

/**
 * Parse keyboard events and emit either dampened values for continuous keypresses, or trigger events named according to a provided keymapping.
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
var KeyboardAdaptor = /** @class */ (function (_super) {
    __extends(KeyboardAdaptor, _super);
    function KeyboardAdaptor(props) {
        var _this = _super.call(this) || this;
        _this.dampingFactor = 0.5;
        _this.incrementor = 1;
        _this.keyMapping = {
            up: ['ArrowUp', 'w', 'W'],
            down: ['ArrowDown', 's', 'S'],
            left: ['ArrowLeft', 'a', 'A'],
            right: ['ArrowRight', 'd', 'D'],
        };
        _this.preventBubbling = true;
        Object.assign(_this, props);
        var values = {};
        for (var key in _this.keyMapping) {
            values[key] = 0;
        }
        _this.damper = new Damper({
            values: values,
            dampingFactor: _this.dampingFactor,
        });
        _this.onKeyUp = _this.onKeyUp.bind(_this);
        _this.onKeyDown = _this.onKeyDown.bind(_this);
        return _this;
    }
    KeyboardAdaptor.prototype.connect = function () {
        document.addEventListener('keyup', this.onKeyUp, true);
        document.addEventListener('keydown', this.onKeyDown, true);
        this.connected = true;
    };
    KeyboardAdaptor.prototype.disconnect = function () {
        document.removeEventListener('keyup', this.onKeyUp, true);
        document.removeEventListener('keydown', this.onKeyDown, true);
        this.connected = false;
    };
    KeyboardAdaptor.prototype.update = function () {
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
    };
    KeyboardAdaptor.prototype.isEnabled = function () {
        return this.connected;
    };
    KeyboardAdaptor.prototype.onKeyUp = function (event) {
        if (this.type === 'discrete') {
            for (var name_1 in this.keyMapping) {
                if (this.keyMapping[name_1].includes(event.key)) {
                    if (this.preventBubbling)
                        event.preventDefault();
                    this.dispatchEvent({
                        type: 'trigger',
                        trigger: name_1,
                    });
                    break;
                }
            }
        }
    };
    KeyboardAdaptor.prototype.onKeyDown = function (event) {
        if (this.type === 'continuous') {
            for (var name_2 in this.keyMapping) {
                if (this.keyMapping[name_2].includes(event.key)) {
                    if (this.preventBubbling)
                        event.preventDefault();
                    this.damper.addToTarget(name_2, this.incrementor);
                    break;
                }
            }
        }
    };
    return KeyboardAdaptor;
}(BaseAdaptor));

/**
 * Parse pointer events to emit dampened, normalized coordinates along with the pointer count (for detecting multi-touch or drag events)
 * @remarks
 * Note: CSS property `touch-action: none` will probably be needed on listener element
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
var PointerAdaptor = /** @class */ (function (_super) {
    __extends(PointerAdaptor, _super);
    function PointerAdaptor(props) {
        var _this = _super.call(this) || this;
        _this.dampingFactor = 0.5;
        _this.domElement = document.body;
        _this.shouldNormalize = true;
        _this.normalizeAroundZero = true;
        _this.pointerCount = 0;
        _this.recordedPosition = false;
        _this.cache = [];
        _this.lastDownTime = 0;
        _this.lastUpTime = 0;
        _this.multipointerThreshold = 100;
        Object.assign(_this, props);
        _this.damper = new Damper({
            values: { x: null, y: null },
            dampingFactor: _this.dampingFactor,
        });
        _this.setDimensions();
        _this.onPointerMove = _this.onPointerMove.bind(_this);
        _this.onPointerUp = _this.onPointerUp.bind(_this);
        _this.onPointerDown = _this.onPointerDown.bind(_this);
        _this.onResize = _this.onResize.bind(_this);
        return _this;
    }
    PointerAdaptor.prototype.connect = function () {
        this.domElement.addEventListener('pointermove', this.onPointerMove, { passive: true });
        this.domElement.addEventListener('pointerdown', this.onPointerDown, { passive: true });
        this.domElement.addEventListener('pointerleave', this.onPointerUp, { passive: true });
        this.domElement.addEventListener('pointerup', this.onPointerUp, { passive: true });
        window.addEventListener('resize', this.onResize);
        this.connected = true;
    };
    PointerAdaptor.prototype.disconnect = function () {
        this.domElement.removeEventListener('pointermove', this.onPointerMove);
        this.domElement.removeEventListener('pointerdown', this.onPointerDown);
        this.domElement.removeEventListener('pointerleave', this.onPointerUp);
        this.domElement.removeEventListener('pointerup', this.onPointerUp);
        this.connected = false;
    };
    PointerAdaptor.prototype.update = function (time) {
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
    };
    PointerAdaptor.prototype.isEnabled = function () {
        return this.connected;
    };
    PointerAdaptor.prototype.setDimensions = function () {
        this.width = this.domElement.getBoundingClientRect().width;
        this.height = this.domElement.getBoundingClientRect().height;
    };
    PointerAdaptor.prototype.getPointerPosition = function (event) {
        // event.offsetLeft is still experimental
        return {
            x: Math.max(0, Math.min(this.width, event.x - this.domElement.offsetLeft)),
            y: Math.max(0, Math.min(this.height, event.y - this.domElement.offsetTop)),
        };
    };
    PointerAdaptor.prototype.normalize = function (values, aroundZero) {
        var x = values.x / this.width;
        var y = values.y / this.height;
        if (aroundZero) {
            x = x * 2 - 1;
            y = y * 2 - 1;
        }
        return { x: x, y: y };
    };
    PointerAdaptor.prototype.onPointerMove = function (event) {
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
    };
    PointerAdaptor.prototype.onPointerDown = function (event) {
        // only deals with left mouse button right now
        // TODO: add some logic for optional right button events
        if (event.button === 0) {
            this.cache.push(event);
            this.lastDownTime = window.performance.now();
        }
    };
    PointerAdaptor.prototype.onPointerUp = function (event) {
        if (event.button === 0 || event.type === 'pointerleave') {
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i].pointerId == event.pointerId) {
                    this.cache.splice(i, 1);
                    break;
                }
            }
            this.lastUpTime = window.performance.now();
        }
    };
    PointerAdaptor.prototype.onResize = function () {
        this.setDimensions();
    };
    return PointerAdaptor;
}(BaseAdaptor));

/**
 * Emits normalized values for the amount a given DOM element has been scrolled through.
 * @example Scroll adaptor
 * ```javascript
 * const scrollAdaptor = new WheelAdaptor({ scrollElement: document.querySelector('.scroller'), dampingFactor: 0.1 })
 * scrollAdaptor.connect()
 * scrollAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y = event.total*Math.PI*2
 * })
 * ```
 */
var ScrollAdaptor = /** @class */ (function (_super) {
    __extends(ScrollAdaptor, _super);
    function ScrollAdaptor(props) {
        var _this = _super.call(this) || this;
        _this.dampingFactor = 0.5;
        _this.isIntersecting = false;
        Object.assign(_this, props);
        _this.values = {
            head: 0,
            body: 0,
            foot: 0,
            total: 0,
        };
        _this.lastSeenScrollValue = 0;
        _this.damper = new Damper({
            values: _this.values,
            dampingFactor: _this.dampingFactor,
        });
        _this.onIntersected = _this.onIntersected.bind(_this);
        _this.observer = new IntersectionObserver(_this.onIntersected);
        return _this;
    }
    ScrollAdaptor.prototype.connect = function () {
        this.observer.observe(this.scrollElement);
        this.connected = true;
    };
    ScrollAdaptor.prototype.disconnect = function () {
        this.observer.unobserve(this.scrollElement);
        this.connected = false;
    };
    //TODO set this to work for any arbitary parent div
    ScrollAdaptor.prototype.update = function () {
        if (this.isIntersecting &&
            this.lastSeenScrollValue !== (this.scrollParent ? this.scrollParent.scrollTop : window.scrollY)) {
            this.lastSeenScrollValue = this.scrollParent ? this.scrollParent.scrollTop : window.scrollY;
            var bounds = this.scrollElement.getBoundingClientRect();
            this.values.head = this.normalize(bounds.top, window.innerHeight, 0);
            this.values.foot = this.normalize(bounds.bottom, window.innerHeight, 0);
            this.values.body = this.normalize(bounds.top, 0, window.innerHeight - bounds.height);
            this.values.total = this.normalize(bounds.top, window.innerHeight, -bounds.height);
            this.damper.setTarget(this.values);
        }
        if (!this.damper.reachedTarget()) {
            this.damper.update();
            this.dispatchEvent({
                type: 'update',
                dampenedValues: this.damper.getCurrentValues(),
                values: this.values,
            });
            if (this.damper.reachedTarget()) {
                this.dispatchEvent({ type: 'inertiacomplete' });
            }
        }
    };
    ScrollAdaptor.prototype.isEnabled = function () {
        return this.connected;
    };
    ScrollAdaptor.prototype.normalize = function (value, start, end) {
        var mapped = (value - start) / (end - start);
        return Math.max(0, Math.min(1, mapped));
    };
    ScrollAdaptor.prototype.onIntersected = function (entries) {
        var entry = entries[0]; // only 1 element to observe
        this.isIntersecting = entry.isIntersecting;
    };
    return ScrollAdaptor;
}(BaseAdaptor));

/**
 * Emits events in response to swipe gestures above a given threshold.
 * @remarks
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
var SwipeAdaptor = /** @class */ (function (_super) {
    __extends(SwipeAdaptor, _super);
    function SwipeAdaptor(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this) || this;
        _this.domElement = document.body;
        _this.thresholdX = 60;
        _this.thresholdY = 60;
        Object.assign(_this, props);
        _this.onPointerUp = _this.onPointerUp.bind(_this);
        _this.onPointerDown = _this.onPointerDown.bind(_this);
        return _this;
    }
    SwipeAdaptor.prototype.connect = function () {
        this.domElement.addEventListener('pointerdown', this.onPointerDown, { passive: true });
        this.domElement.addEventListener('pointerup', this.onPointerUp, { passive: true });
        this.connected = true;
    };
    SwipeAdaptor.prototype.disconnect = function () {
        this.domElement.removeEventListener('pointerdown', this.onPointerDown);
        this.domElement.removeEventListener('pointerup', this.onPointerUp);
        this.connected = false;
    };
    SwipeAdaptor.prototype.update = function () {
        // nothing to do here
    };
    SwipeAdaptor.prototype.isEnabled = function () {
        return this.connected;
    };
    SwipeAdaptor.prototype.onPointerDown = function (event) {
        if (event.pointerType !== 'mouse' && event.isPrimary) {
            this.startX = event.screenX;
            this.startY = event.screenY;
        }
    };
    SwipeAdaptor.prototype.onPointerUp = function (event) {
        if (event.pointerType !== 'mouse' && event.isPrimary) {
            var diffX = event.screenX - this.startX;
            var diffY = event.screenY - this.startY;
            if (Math.abs(diffX) >= this.thresholdX || Math.abs(diffY) >= this.thresholdY) {
                this.dispatchEvent({
                    type: 'trigger',
                    x: Math.abs(diffX) >= this.thresholdX ? Math.sign(diffX) : 0,
                    y: Math.abs(diffY) >= this.thresholdY ? Math.sign(-1 * diffY) : 0,
                });
            }
        }
    };
    return SwipeAdaptor;
}(BaseAdaptor));

/**
 * Parse mouse wheel events and emit either dampened values, or trigger events for swipes that cross a given threshold.
 * @example Discrete adaptor
 * ```javascript
 * const wheelAdaptor = new WheelAdaptor({ type: 'discrete' })
 * wheelAdaptor.connect()
 * wheelAdaptor.addEventListener('trigger', (event) => {
 *   cube.scale.y += event.y*0.1
 * })
 * ```
 */
var WheelAdaptor = /** @class */ (function (_super) {
    __extends(WheelAdaptor, _super);
    function WheelAdaptor(props) {
        var _this = _super.call(this) || this;
        _this.dampingFactor = 0.5;
        _this.thresholdX = 15;
        _this.thresholdY = 15;
        _this.debounceDuration = 700;
        _this.lastThresholdTrigger = 0;
        Object.assign(_this, props);
        _this.damper = new Damper({
            values: { x: 0, y: 0 },
            dampingFactor: _this.dampingFactor,
        });
        _this.onWheel = _this.onWheel.bind(_this);
        return _this;
    }
    WheelAdaptor.prototype.connect = function () {
        var element = this.domElement || window;
        element.addEventListener('wheel', this.onWheel, { passive: true });
        this.connected = true;
    };
    WheelAdaptor.prototype.disconnect = function () {
        var element = this.domElement || window;
        element.removeEventListener('wheel', this.onWheel);
        this.connected = false;
    };
    WheelAdaptor.prototype.update = function () {
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
    };
    WheelAdaptor.prototype.isEnabled = function () {
        return this.connected;
    };
    WheelAdaptor.prototype.onWheel = function (event) {
        if (this.type === 'continuous') {
            this.damper.addToTarget('x', event.deltaX);
            this.damper.addToTarget('y', event.deltaY);
        }
        else if (this.type === 'discrete') {
            if (Math.abs(event.deltaX) >= this.thresholdX || Math.abs(event.deltaY) >= this.thresholdY) {
                var now = window.performance.now();
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
    };
    return WheelAdaptor;
}(BaseAdaptor));

/**
 * Control scheme to move the camera with arrow/WASD keys and mouse wheel; and rotate the camera with click-and-drag events.
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new FreeMovementControls(cameraRig)
 *
 * controls.enable()
 * function animate(t) {
 *  // render loop
 *  controls.update(t)
 * }
 * ```
 */
var FreeMovementControls = /** @class */ (function () {
    function FreeMovementControls(cameraRig, props) {
        if (props === void 0) { props = {}; }
        this.enabled = false;
        this.cameraRig = cameraRig;
        this.wheelScaleFactor = props.wheelScaleFactor || 0.05;
        this.pointerScaleFactor = props.pointerScaleFactor || 4;
        this.panDegreeFactor = props.panDegreeFactor || Math.PI / 4;
        this.tiltDegreeFactor = props.tiltDegreeFactor || Math.PI / 10;
        this.keyboardAdaptor = new KeyboardAdaptor({
            type: 'continuous',
            dampingFactor: props.keyboardDampFactor || 0.5,
            incrementor: props.keyboardScaleFactor || 0.5,
            keyMapping: {
                forward: ['ArrowUp', 'w', 'W'],
                backward: ['ArrowDown', 's', 'S'],
                left: ['ArrowLeft', 'a', 'A'],
                right: ['ArrowRight', 'd', 'D'],
                up: ['t', 'T'],
                down: ['b', 'B'],
            },
        });
        this.wheelAdaptor = new WheelAdaptor({
            type: 'continuous',
            dampingFactor: props.wheelDampFactor || 0.25,
            domElement: props.domElement || document.body,
        });
        this.pointerAdaptor = new PointerAdaptor({
            dampingFactor: props.pointerDampFactor || 0.3,
        });
        this.onWheel = this.onWheel.bind(this);
        this.onKey = this.onKey.bind(this);
        this.onPointer = this.onPointer.bind(this);
    }
    FreeMovementControls.prototype.isEnabled = function () {
        return this.enabled;
    };
    FreeMovementControls.prototype.enable = function () {
        this.wheelAdaptor.connect();
        this.keyboardAdaptor.connect();
        this.pointerAdaptor.connect();
        this.wheelAdaptor.addEventListener('update', this.onWheel);
        this.keyboardAdaptor.addEventListener('update', this.onKey);
        this.pointerAdaptor.addEventListener('update', this.onPointer);
        this.enabled = true;
    };
    FreeMovementControls.prototype.disable = function () {
        this.wheelAdaptor.disconnect();
        this.keyboardAdaptor.disconnect();
        this.pointerAdaptor.disconnect();
        this.wheelAdaptor.removeEventListener('update', this.onWheel);
        this.keyboardAdaptor.removeEventListener('update', this.onKey);
        this.pointerAdaptor.removeEventListener('update', this.onPointer);
        this.enabled = false;
    };
    FreeMovementControls.prototype.onWheel = function (event) {
        this.cameraRig.do(CameraAction.Dolly, event.deltas.y * this.wheelScaleFactor);
        this.cameraRig.do(CameraAction.Truck, event.deltas.x * this.wheelScaleFactor);
    };
    FreeMovementControls.prototype.onKey = function (event) {
        this.cameraRig.do(CameraAction.Dolly, event.values.backward - event.values.forward);
        this.cameraRig.do(CameraAction.Truck, event.values.right - event.values.left);
        this.cameraRig.do(CameraAction.Pedestal, event.values.up - event.values.down);
    };
    FreeMovementControls.prototype.onPointer = function (event) {
        switch (event.pointerCount) {
            case 1:
                this.cameraRig.do(CameraAction.Pan, event.deltas.x * this.panDegreeFactor);
                this.cameraRig.do(CameraAction.Tilt, event.deltas.y * this.tiltDegreeFactor);
                break;
            case 2:
                this.cameraRig.do(CameraAction.Dolly, -event.deltas.y * this.pointerScaleFactor);
                this.cameraRig.do(CameraAction.Truck, -event.deltas.x * this.pointerScaleFactor);
                break;
        }
    };
    FreeMovementControls.prototype.update = function (time) {
        if (this.enabled) {
            this.keyboardAdaptor.update();
            this.wheelAdaptor.update();
            this.pointerAdaptor.update(time);
        }
    };
    return FreeMovementControls;
}());

/**
 * Control scheme to scrub through the CameraRig's `AnimationClip` based on the scroll of a DOM Element
 * @example
 * ```js
 * const scene = new Scene()
 * const gltfLoader = new GLTFLoader()
 * let camera, cameraRig, controls
 *
 * gltfLoader.load(cameraPath, (gltf) => {
 *  camera = gltf.cameras[0]
 *  cameraRig = new CameraRig(gltf.cameras[0], scene, { animationClip: gltf.animations[0] })
 *  controls = new ScrollControls(cameraRig, {
 *    scrollElement: document.querySelector('.scroller')
 *  })
 *  controls.enable()
 * })
 *
 * function animate() {
 *  // render loop
 *  controls.update()
 * }
 * ```
 */
var ScrollControls = /** @class */ (function () {
    function ScrollControls(cameraRig, props) {
        this.enabled = false;
        this.cameraRig = cameraRig;
        this.cameraRig.setAnimationTime(0);
        this.scrollAdaptor = new ScrollAdaptor({
            scrollElement: props.scrollElement,
            scrollParent: props.scrollParent,
            dampingFactor: props.dampingFactor || 1,
        });
        this.onScroll = this.onScroll.bind(this);
    }
    ScrollControls.prototype.isEnabled = function () {
        return this.enabled;
    };
    ScrollControls.prototype.enable = function () {
        this.scrollAdaptor.connect();
        this.scrollAdaptor.addEventListener('update', this.onScroll);
        this.enabled = true;
    };
    ScrollControls.prototype.disable = function () {
        this.scrollAdaptor.disconnect();
        this.scrollAdaptor.removeEventListener('update', this.onScroll);
        this.enabled = false;
    };
    ScrollControls.prototype.update = function () {
        if (this.enabled) {
            this.scrollAdaptor.update();
        }
    };
    ScrollControls.prototype.onScroll = function (event) {
        this.cameraRig.setAnimationPercentage(event.values.total);
    };
    return ScrollControls;
}());

/**
 * Control scheme to transition the camera between given points in world space.
 * @example
 * ```js
 *
 * const pois = [
 *  { lookAtPosition: new Vector3(...), lookAtOrientation: new Quaternion(...) },
 *  { lookAtPosition: new Vector3(...), lookAtOrientation: new Quaternion(...) },
 * ]
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new StoryPointsControls(cameraRig, pois)
 *
 * controls.enable()
 * controls.goToPOI(0)
 * controls.addEventListener('ExitStoryPoints', (e) => {
 *  alert(`Exit story points from _${e.exitFrom}_ event fired`)
 * })
 *
 * // assuming some 'nextBtn' and 'prevBtn' dom elements have been created
 * nextBtn.on('click', () => controls.nextPOI() )
 * prevBtn.on('click', () => controls.prevPOI() )
 * ```
 */
var StoryPointsControls = /** @class */ (function (_super) {
    __extends(StoryPointsControls, _super);
    function StoryPointsControls(cameraRig, pois, props) {
        if (pois === void 0) { pois = []; }
        if (props === void 0) { props = {}; }
        var _this = _super.call(this) || this;
        _this.currentIndex = null;
        _this.upcomingIndex = null;
        _this.enabled = false;
        _this.cycle = false;
        _this.cameraRig = cameraRig;
        _this.pois = pois;
        Object.assign(_this, props);
        _this.onCameraStart = _this.onCameraStart.bind(_this);
        _this.onCameraUpdate = _this.onCameraUpdate.bind(_this);
        _this.onCameraEnd = _this.onCameraEnd.bind(_this);
        return _this;
    }
    StoryPointsControls.prototype.getCurrentIndex = function () {
        return this.currentIndex;
    };
    StoryPointsControls.prototype.nextPOI = function () {
        var next = this.currentIndex + 1;
        if (next >= this.pois.length && !this.cycle) {
            this.dispatchEvent({
                type: 'ExitStoryPoints',
                exitFrom: 'end',
            });
        }
        else {
            this.goToPOI(next % this.pois.length);
        }
    };
    StoryPointsControls.prototype.prevPOI = function () {
        var prev = this.currentIndex - 1;
        if (prev < 0 && !this.cycle) {
            this.dispatchEvent({
                type: 'ExitStoryPoints',
                exitFrom: 'start',
            });
        }
        else {
            this.goToPOI((prev + this.pois.length) % this.pois.length);
        }
    };
    StoryPointsControls.prototype.goToPOI = function (index) {
        this.upcomingIndex = index;
        var poi = this.pois[this.upcomingIndex];
        this.cameraRig.flyTo(poi.lookAtPosition, poi.lookAtOrientation, this.duration, this.ease);
    };
    StoryPointsControls.prototype.enable = function () {
        this.cameraRig.addEventListener('CameraMoveStart', this.onCameraStart);
        this.cameraRig.addEventListener('CameraMoveUpdate', this.onCameraUpdate);
        this.cameraRig.addEventListener('CameraMoveEnd', this.onCameraEnd);
        this.enabled = true;
    };
    StoryPointsControls.prototype.disable = function () {
        this.cameraRig.removeEventListener('CameraMoveStart', this.onCameraStart);
        this.cameraRig.removeEventListener('CameraMoveUpdate', this.onCameraUpdate);
        this.cameraRig.removeEventListener('CameraMoveEnd', this.onCameraEnd);
        this.enabled = false;
    };
    StoryPointsControls.prototype.update = function () {
        // nothing to do here
    };
    StoryPointsControls.prototype.isEnabled = function () {
        return this.enabled;
    };
    StoryPointsControls.prototype.updatePois = function (progress) {
        this.dispatchEvent({
            type: 'update',
            currentIndex: this.currentIndex,
            upcomingIndex: this.upcomingIndex,
            progress: progress,
        });
    };
    StoryPointsControls.prototype.onCameraStart = function () {
        this.updatePois(0);
    };
    StoryPointsControls.prototype.onCameraUpdate = function (event) {
        this.updatePois(event.progress);
    };
    StoryPointsControls.prototype.onCameraEnd = function () {
        this.currentIndex = this.upcomingIndex;
        this.upcomingIndex = null;
    };
    return StoryPointsControls;
}(EventDispatcher));

/**
 * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
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
 *  cameraRig = new CameraRig(gltf.cameras[0], scene, { animationClip: gltf.animations[0] })
 *  controls = new PathPointsControls(cameraRig, pois)
 *  pois[0].show(1)
 *  controls.enable()
 *  controls.addEventListener('ExitPathPoints', (e) => {
 *    alert(`Exit path points from _${e.exitFrom}_ event fired`)
 *  })
 * })
 * ```
 */
var PathPointsControls = /** @class */ (function (_super) {
    __extends(PathPointsControls, _super);
    function PathPointsControls(cameraRig, pois, props) {
        if (pois === void 0) { pois = []; }
        if (props === void 0) { props = {}; }
        var _this = _super.call(this) || this;
        _this.currentIndex = 0;
        _this.upcomingIndex = null;
        _this.enabled = false;
        _this.wheelThreshold = 15;
        _this.swipeThreshold = 60;
        _this.cameraRig = cameraRig;
        _this.pois = pois;
        Object.assign(_this, props);
        _this.wheelAdaptor = new WheelAdaptor({ type: 'discrete', thresholdY: _this.wheelThreshold });
        _this.swipeAdaptor = new SwipeAdaptor({ thresholdY: _this.swipeThreshold });
        _this.keyboardAdaptor = new KeyboardAdaptor({ type: 'discrete' });
        _this.onCameraStart = _this.onCameraStart.bind(_this);
        _this.onCameraUpdate = _this.onCameraUpdate.bind(_this);
        _this.onCameraEnd = _this.onCameraEnd.bind(_this);
        _this.onTrigger = _this.onTrigger.bind(_this);
        _this.onKey = _this.onKey.bind(_this);
        return _this;
    }
    PathPointsControls.prototype.getCurrentIndex = function () {
        return this.currentIndex;
    };
    PathPointsControls.prototype.enable = function () {
        this.wheelAdaptor.addEventListener('trigger', this.onTrigger);
        this.swipeAdaptor.addEventListener('trigger', this.onTrigger);
        this.keyboardAdaptor.addEventListener('trigger', this.onKey);
        this.cameraRig.addEventListener('CameraMoveStart', this.onCameraStart);
        this.cameraRig.addEventListener('CameraMoveUpdate', this.onCameraUpdate);
        this.cameraRig.addEventListener('CameraMoveEnd', this.onCameraEnd);
        this.wheelAdaptor.connect();
        this.swipeAdaptor.connect();
        this.keyboardAdaptor.connect();
        this.enabled = true;
    };
    PathPointsControls.prototype.disable = function () {
        this.wheelAdaptor.removeEventListener('trigger', this.onTrigger);
        this.swipeAdaptor.removeEventListener('trigger', this.onTrigger);
        this.keyboardAdaptor.removeEventListener('trigger', this.onKey);
        this.cameraRig.removeEventListener('CameraMoveStart', this.onCameraStart);
        this.cameraRig.removeEventListener('CameraMoveUpdate', this.onCameraUpdate);
        this.cameraRig.removeEventListener('CameraMoveEnd', this.onCameraEnd);
        this.wheelAdaptor.disconnect();
        this.swipeAdaptor.disconnect();
        this.keyboardAdaptor.disconnect();
        this.enabled = false;
    };
    PathPointsControls.prototype.update = function () {
        // nothing to do here
    };
    PathPointsControls.prototype.isEnabled = function () {
        return this.enabled;
    };
    PathPointsControls.prototype.onKey = function (event) {
        switch (event.trigger) {
            case 'up':
                this.onTrigger({ y: -1 });
                break;
            case 'down':
                this.onTrigger({ y: 1 });
                break;
        }
    };
    PathPointsControls.prototype.onTrigger = function (event) {
        var index = this.currentIndex + event.y;
        if (index >= this.pois.length) {
            this.dispatchEvent({
                type: 'ExitPathPoints',
                exitFrom: 'end',
            });
        }
        else if (index < 0) {
            this.dispatchEvent({
                type: 'ExitPathPoints',
                exitFrom: 'start',
            });
        }
        else {
            this.upcomingIndex = index;
            this.cameraRig.flyToKeyframe(this.pois[this.upcomingIndex].frame, this.duration, this.ease);
        }
    };
    PathPointsControls.prototype.updatePois = function (progress) {
        this.dispatchEvent({
            type: 'update',
            currentIndex: this.currentIndex,
            upcomingIndex: this.upcomingIndex,
            progress: progress,
        });
    };
    PathPointsControls.prototype.onCameraStart = function () {
        this.updatePois(0);
    };
    PathPointsControls.prototype.onCameraUpdate = function (event) {
        this.updatePois(event.progress);
    };
    PathPointsControls.prototype.onCameraEnd = function () {
        this.currentIndex = this.upcomingIndex;
        this.upcomingIndex = null;
    };
    return PathPointsControls;
}(EventDispatcher));

/**
 * Control scheme for slight rotation and translation movement in response to mouse movements (designed to be used in conjunction with other control schemes)
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new ThreeDOFControls(cameraRig)
 *
 * controls.enable()
 * function animate(t) {
 *  // render loop
 *  controls.update(t)
 * }
 * ```
 */
var ThreeDOFControls = /** @class */ (function () {
    function ThreeDOFControls(cameraRig, props) {
        if (props === void 0) { props = {}; }
        this.enabled = false;
        this.panFactor = Math.PI / 20;
        this.tiltFactor = Math.PI / 20;
        this.truckFactor = 1;
        this.pedestalFactor = 1;
        this.dampingFactor = 0.7;
        this.cameraRig = cameraRig;
        Object.assign(this, props);
        this.pointerAdaptor = new PointerAdaptor({
            dampingFactor: this.dampingFactor,
        });
        this.onPointerMove = this.onPointerMove.bind(this);
    }
    ThreeDOFControls.prototype.isEnabled = function () {
        return this.enabled;
    };
    ThreeDOFControls.prototype.enable = function () {
        this.pointerAdaptor.connect();
        this.pointerAdaptor.addEventListener('update', this.onPointerMove);
        this.enabled = true;
    };
    ThreeDOFControls.prototype.disable = function () {
        this.pointerAdaptor.disconnect();
        this.pointerAdaptor.removeEventListener('update', this.onPointerMove);
        this.enabled = false;
    };
    ThreeDOFControls.prototype.update = function (time) {
        if (this.enabled) {
            this.pointerAdaptor.update(time);
        }
    };
    ThreeDOFControls.prototype.onPointerMove = function (event) {
        if (event.pointerCount === 0) {
            this.cameraRig.do(CameraAction.Pan, -event.deltas.x * this.panFactor);
            this.cameraRig.do(CameraAction.Tilt, -event.deltas.y * this.tiltFactor);
            this.cameraRig.do(CameraAction.LocalTruck, event.deltas.x * this.truckFactor);
            this.cameraRig.do(CameraAction.LocalPedestal, event.deltas.y * this.pedestalFactor);
        }
    };
    return ThreeDOFControls;
}());

export { Axis, BaseAdaptor, CameraAction, CameraRig, Damper, FreeMovementControls, KeyboardAdaptor, PathPointsControls, PointerAdaptor, ScrollAdaptor, ScrollControls, StoryPointsControls, SwipeAdaptor, ThreeDOFControls, WheelAdaptor };
//# sourceMappingURL=threebird-controls.web.esm.js.map
