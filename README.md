Stage0 Render
====
#### Rete.js plugin

Rete renderer using https://www.npmjs.com/package/stage0 (~1.6 kb framewok)

Example: https://codepen.io/anon/pen/jQBxKe

Package features a separate CSS stylesheet

```js
import Stage0RenderPlugin from 'rete-stage0-render-plugin';

editor.use(Stage0RenderPlugin);
```

```js
import CustomNodeComponent from './CustomNodeComponent.js';

class MyComponent extends Rete.Component {
    constructor(){
        // ...
        this.data.render = 'stage0';
        this.data.component = CustomNodeComponent; // stage0.js component, not required
        this.data.props = {}; // props for the component above, not required
    }
}

```

```js
const node = editor.nodes[0];
const control = node.controls.get('ctrl');

node.update(); // force update
control.update(); // of view

// in some cases you can gt stage0.js context
node.stage0Context
control.stage0Context
```
