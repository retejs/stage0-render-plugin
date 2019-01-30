Stage0 Render
====
#### Rete.js plugin

Rete renderer using https://www.npmjs.com/package/stage0 (~1.6 kB framework)

Example: https://codepen.io/anon/pen/jQBxKe

This package features a separate CSS stylesheet which you can, for example, reference in your `index.html`: 

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rete-stage0-menu-plugin@0.3.7/build/stage0-menu-plugin.debug.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rete-stage0-render-plugin@0.2.14/build/stage0-render-plugin.debug.css">
```

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
