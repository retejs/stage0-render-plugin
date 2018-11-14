Stage0 Render
====
#### Rete.js plugin

```js
import Stage0RenderPlugin from 'rete-stage0-render-plugin';

editor.use(Stage0RenderPlugin);
```
TODO

```js
import CustomNodeComponent from './CustomNodeComponent.js';
import CustomControlComponent from './CustomControlComponent.js';

class MyComponent extends Rete.Component {
    constructor(){
        // ...
        this.data.render = 'stage0';
        this.data.component = CustomNodeComponent; // stage0.js component, not required
        this.data.props = {}; // props for the component above, not required
    }
}

class MyControl extends Rete.Control {
    constructor(){
        // ...
        this.data.render = 'stage0';
        this.data.component = CustomControlComponent; // stage0.js component, required
        this.data.props = {}; // props for the component above, not required
    }
}
```
TODO

```js
const node = editor.nodes[0];
const control = node.controls.get('ctrl');

node.update(); // force update
control.update(); // of view

// in some cases you can gt stage0.js context
node.stage0Context
control.stage0Context
```
