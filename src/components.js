import h from "./stage0/index";
import { reconcile } from "./stage0/reconcile";

import "./node.sass";
import "./socket.sass";

/**
 * Base component
 * @param {*} scope
 */
export function BaseComponent(scope) {
  const view = this.getView();

  this.root = view.cloneNode(true);

  const refCl = view.collect(this.root);

  this.setRefs(refCl);
  this.init(scope);
}

BaseComponent.prototype = {
  getView: function() {
    return h(["<div></div>"]);
  },
  init: function(scope) {
    this.root.update = this.rootUpdate.bind(this);
    this.root.update(scope);
  },
  setRefs: function(refCl) {
    this.refs = refCl;
  },
  rootUpdate: function(_scope) {}
};

export function extend(ChildClass, ParentClass) {
  ChildClass.prototype = Object.assign({}, ParentClass.prototype, ChildClass.prototype);
  ChildClass.prototype.constructor = ChildClass;
}

/**
 * Socket component
 * @param {*} socket
 * @param {*} type
 */
export function SocketComponent(io, type, node) {
  this.type = type;
  this.node = node;
  BaseComponent.call(this, io);
}

SocketComponent.prototype.init = function(io) {
  BaseComponent.prototype.init.call(this, io.socket);
  this.node.context.bindSocket(this.root, this.type, io);
};

SocketComponent.prototype.getView = function() {
  return h(["<div></div>"]);
};

SocketComponent.prototype.rootUpdate = function(socket) {
  this.root.className = "socket " + socket.name + " " + this.type;
  this.root.title = socket.name + "\\n" + (socket.hint ? socket.hint : "");
};

extend(SocketComponent, BaseComponent);

/**
 * Control component
 * @param {*} control
 */
export function ControlComponent(control) {
  this.control = control;
  BaseComponent.call(this, control);
}

ControlComponent.prototype.init = function(control) {
  this.control.parent.context.bindControl(this.root, control);
  BaseComponent.prototype.init.call(this, control);
};

ControlComponent.prototype.getView = function() {
  return h(['<div class="control"></div>']);
};

ControlComponent.prototype.rootUpdate = function(control) {
  this.control = control;
  while (this.root.firstChild) {
    this.root.removeChild(this.root.firstChild);
  }
  this.root.appendChild(control.stage0Context.root);
};

extend(ControlComponent, BaseComponent);

/**
 * Input component
 * @param {*} input
 */
export function InputComponent(input, node) {
  this.name = null;
  this.node = node;
  BaseComponent.call(this, input);
}

InputComponent.prototype.getView = function() {
  return h(['<div class="input"><div #socket></div><div class="input-title" #inputTitle>#inputName</div></div>']);
};

InputComponent.prototype.getSocketComponent = function(input) {
  return new SocketComponent(input, "input", this.node);
};

InputComponent.prototype.rootUpdate = function(input) {
  let name = input.name;

  if (input.showControl()) {
    this.root.appendChild(this.refs.inputtitle);
    if (this.name !== name) {
      this.name = this.refs.inputName.nodeValue = name;
    }
  } else {
    if (this.root.contains(this.refs.inputtitle)) this.root.removeChild(this.refs.inputtitle);
  }

  const socketComp = this.getSocketComponent(input);

  while (this.refs.socket.firstChild) {
    this.refs.socket.removeChild(this.refs.socket.firstChild);
  }
  this.refs.socket.appendChild(socketComp.root);
};

extend(InputComponent, BaseComponent);

/**
 * Output component
 * @param {*} output
 */
export function OutputComponent(output, node) {
  this.name = null;
  this.node = node;
  BaseComponent.call(this, output);
}

OutputComponent.prototype.getView = function() {
  return h(['<div class="output"><div class="output-title" #outputTitle>#outputName</div><div #socket></div></div>']);
};

OutputComponent.prototype.getSocketComponent = function(output) {
  return new SocketComponent(output, "output", this.node);
};

OutputComponent.prototype.rootUpdate = function(output) {
  let name = output.name;

  if (this.name !== name) {
    this.name = this.refs.outputName.nodeValue = name;
  }
  const socketComp = this.getSocketComponent(output);

  while (this.refs.socket.firstChild) {
    this.refs.socket.removeChild(this.refs.socket.firstChild);
  }
  this.refs.socket.appendChild(socketComp.root);
};

extend(OutputComponent, BaseComponent);

/**
 * Node component
 * @param {*} item
 * @param {*} scope
 */
export function NodeComponent(scope) {
  this.renderedInputs = [];
  this.renderedOutputs = [];
  this.renderedControls = [];

  this.visibleInputs = undefined;
  this.visibleOutputs = undefined;
  this.visibleControls = undefined;

  this.name = null;

  BaseComponent.call(this, scope);
}

NodeComponent.prototype.getView = function() {
  return h(['<div class="node"><div class="title">#nodeName</div><div #outputs></div><div #controls></div><div #inputs></div></div>']);
};

NodeComponent.prototype.getInputComponent = function(item, node) {
  return new InputComponent(item, node);
};

NodeComponent.prototype.getOutputComponent = function(item, node) {
  return new OutputComponent(item, node);
};

NodeComponent.prototype.getControlComponent = function(item, node) {
  return new ControlComponent(item, node);
};

NodeComponent.prototype.rootUpdate = function(scope) {
  this.root.className =
    "node " + scope.node.name + (scope.editor.selected.contains(scope.node) ? " selected" : "");

  if (this.name !== scope.node.name) {
    this.name = this.refs.nodeName.nodeValue = scope.node.name;
  }

  this.visibleInputs = Array.from(scope.node.inputs.values()).slice();

  reconcile(
    this.refs.inputs,
    this.renderedInputs,
    this.visibleInputs,
    item => this.getInputComponent(item, scope.node).root,
    (node, item) => node.update(item)
  );

  this.renderedInputs = this.visibleInputs.slice();

  this.visibleOutputs = Array.from(scope.node.outputs.values()).slice();

  reconcile(
    this.refs.outputs,
    this.renderedOutputs,
    this.visibleOutputs,
    item => {
      return this.getOutputComponent(item, scope.node).root;
    },
    (node, item) => node.update(item)
  );

  this.renderedOutputs = this.visibleOutputs.slice();

  this.visibleControls = Array.from(scope.node.controls.values()).slice();

  reconcile(
    this.refs.controls,
    this.renderedControls,
    this.visibleControls,
    item => this.getControlComponent(item, scope.node).root,
    (node, item) => node.update(item)
  );

  this.renderedControls = this.visibleControls.slice();
};

extend(NodeComponent, BaseComponent);
