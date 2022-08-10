import h from "stage0";

import {
  NodeComponent,
  SocketComponent,
  InputComponent,
  OutputComponent,
  ControlComponent,
  extend,
  BaseComponent
} from "./components";

/**
 * Control component
 * @param {*} control
 */
function RootControlComponent(editor, { el, control, controlProps }) {
  this.component = Object.assign({}, control.component, controlProps);

  this.editor = editor;
  this.el = el;

  BaseComponent.call(this, control);
  this.component.root = this.root;
}

RootControlComponent.prototype.getView = function() {
  return h([this.component.template]);
};

RootControlComponent.prototype.init = function(_control) {
  this.root.update = this.rootUpdate.bind(this);
};

RootControlComponent.prototype.rootUpdate = function(_control) {
  this.component.methods.update.apply(this.component);
};

extend(RootControlComponent, BaseComponent);

function createNode({ el, nodeProps, component }) {
  const comp = component.component || new NodeComponent(nodeProps);
  nodeProps.node.stage0Context = comp;
  el.appendChild(comp.root);
  return comp;
}

function createControl(editor, { el, control, controlProps }) {
  const comp = new RootControlComponent(editor, { el, control, controlProps });

  control.stage0Context = comp;

  el.appendChild(comp.root);

  comp.component.mounted();

  return comp;
}

function install(editor, _params) {
  editor.on("rendernode", ({ el, node, component, bindSocket, bindControl }) => {
    if (component.render && component.render !== "stage0") return;
    const nodeProps = { ...component.props, node, editor, bindSocket, bindControl };
    node.context = nodeProps;
    node._stage0 = createNode({ el, nodeProps, component });
    node.update = () => {
      node.stage0Context.rootUpdate(nodeProps);
    };
  });

  editor.on("rendercontrol", ({ el, control }) => {
    if (control.render && control.render !== "stage0") return;
    let controlProps = {
      ...control.props,
      getData: control.getData.bind(control),
      putData: control.putData.bind(control)
    };
    control._stage0 = createControl(editor, { el, control, controlProps });
    control.update = () => {
      control.stage0Context.rootUpdate(controlProps);
    };
  });

  editor.on("connectioncreated connectionremoved", connection => {
    let inputContext = connection.input.node.context;
    let outputContext = connection.output.node.context;
    connection.output.node.stage0Context.rootUpdate(outputContext);
    connection.input.node.stage0Context.rootUpdate(inputContext);
  });

  editor.on("nodeselected", () => {
    for (const key in editor.nodes) {
      const editorNode = editor.nodes[key];
      const context = editorNode.context;
      editorNode.stage0Context.rootUpdate(context);
    }
  });
}

export default {
  name: "stage0-render",
  install,
  NodeComponent,
  InputComponent,
  OutputComponent,
  ControlComponent,
  RootControlComponent,
  SocketComponent
};
