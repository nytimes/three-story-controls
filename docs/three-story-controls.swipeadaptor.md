<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [three-story-controls](./three-story-controls.md) &gt; [SwipeAdaptor](./three-story-controls.swipeadaptor.md)

## SwipeAdaptor class

Emits events in response to swipe gestures above a given threshold.

<b>Signature:</b>

```typescript
export declare class SwipeAdaptor extends BaseAdaptor 
```
<b>Extends:</b> [BaseAdaptor](./three-story-controls.baseadaptor.md)

## Remarks

See [SwipeAdaptorProps](./three-story-controls.swipeadaptorprops.md) for all properties that can be passed to the constructor. See [SwipeAdaptorEvent](./three-story-controls.swipeadaptorevent.md) for emitted event signatures. Note: CSS property `touch-action: none` will probably be needed on listener element

## Example

Swipe adaptor

```javascript
const swipeAdaptor = new SwipeAdaptor()
swipeAdaptor.connect()
swipeAdaptor.addEventListener('trigger', (event) => {
  cube.scale.y += event.y*0.1
})

```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(props)](./three-story-controls.swipeadaptor._constructor_.md) |  | Constructs a new instance of the <code>SwipeAdaptor</code> class |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [connect()](./three-story-controls.swipeadaptor.connect.md) |  |  |
|  [disconnect()](./three-story-controls.swipeadaptor.disconnect.md) |  |  |
|  [isEnabled()](./three-story-controls.swipeadaptor.isenabled.md) |  |  |
|  [update()](./three-story-controls.swipeadaptor.update.md) |  |  |

