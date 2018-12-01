import h from "stage0";
import { keyed } from "stage0/keyed";

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
  this.name;
  this.hint;
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
  if (this.name !== socket.name) this.root.className = "socket " + socket.name + " " + this.type;

  if (this.name !== socket.name || this.hint !== socket.hint)
    this.root.title = socket.name + "\\n" + (socket.hint ? socket.hint : "");

  this.name = socket.name;
  this.hint = socket.hint;
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
  let ctx;
  if (this.control.parent.context) ctx = this.control.parent.context;
  else if (this.control.parent.node) ctx = this.control.parent.node.context;
  ctx.bindControl(this.root, control);
  BaseComponent.prototype.init.call(this, control);

  this.root.addEventListener("mousedown", e => {
    e.stopPropagation();
  });
};

ControlComponent.prototype.getView = function() {
  return h(['<div class="control"></div>']);
};

ControlComponent.prototype.rootUpdate = function(control) {
  if (this.control.key !== control.key) {
    while (this.root.firstChild) {
      this.root.removeChild(this.root.firstChild);
    }
    this.root.appendChild(control.stage0Context.root);
  }
  this.control = control;
};

extend(ControlComponent, BaseComponent);

/**
 * Input component
 * @param {*} input
 */
export function InputComponent(input, node) {
  this.name = null;
  this.node = node;
  this.showControl = null;
  BaseComponent.call(this, input);
}

InputComponent.prototype.getView = function() {
  return h([
    '<div class="input"><span class="input-socket" #socket></span><div class="input-title" #inputTitle>#inputName</div><div class="input-control" #controls></div></div>'
  ]);
};

InputComponent.prototype.getSocketComponent = function(input) {
  return new SocketComponent(input, "input", this.node);
};

InputComponent.prototype.getControlComponent = function(input) {
  return new ControlComponent(input.control, input.node);
};

InputComponent.prototype.rootUpdate = function(input) {
  const name = input.name;
  const showControl = input.showControl();

  if (this.showControl !== showControl) {
    while (this.refs.controls.firstChild) {
      this.refs.controls.removeChild(this.refs.controls.firstChild);
    }
    if (this.root.contains(this.refs.inputtitle)) {
      this.root.removeChild(this.refs.inputtitle);
    }
    if (showControl) {
      const controlComp = this.getControlComponent(input);
      this.refs.controls.appendChild(controlComp.root);
    } else {
      this.root.appendChild(this.refs.inputtitle);
      if (this.name !== name) {
        this.name = this.refs.inputName.nodeValue = name;
      }
    }
  }

  if (!this.refs.socket.firstChild) {
    const compSocket = this.getSocketComponent(input);
    this.refs.socket.appendChild(compSocket.root);
  }
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
  return h([
    '<div class="output"><div class="output-title" #outputTitle>#outputName</div><div #socket></div></div>'
  ]);
};

OutputComponent.prototype.getSocketComponent = function(output) {
  return new SocketComponent(output, "output", this.node);
};

OutputComponent.prototype.rootUpdate = function(output) {
  let name = output.name;

  if (this.name !== name) {
    this.name = this.refs.outputName.nodeValue = name;
  }

  if (!this.refs.socket.firstChild) {
    const compSocket = this.getSocketComponent(output);
    this.refs.socket.appendChild(compSocket.root);
  }
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
  this.selected = null;

  this.visibleCollapsed = scope.node.data["collapsed"] ? true : false;
  this.renderedCollapsed = null;  

  BaseComponent.call(this, scope);
}

NodeComponent.prototype.init = function(scope) {
  BaseComponent.prototype.init.call(this, scope);

  this.refs.collapse.addEventListener("mousedown", e => {
    e.stopPropagation();
  });

  this.refs.collapse.addEventListener("click", _e => {
    if (this.refs.collapse.classList.contains("closed")) {
      this.visibleCollapsed = false;
    } else {
      this.visibleCollapsed = true;
    }

    if(this.visibleCollapsed !== this.renderedCollapsed){
      this.rootUpdate(scope);
      scope.editor.view.updateConnections({ node: scope.node });
    }
  });

  this.refs.collapse.ondblclick = function(e) {
    e.stopPropagation();
  };
};

NodeComponent.prototype.getView = function() {
  return h([
    '<div class="node"><div class="collapse" #collapse></div><div class="title">#nodeName</div><div class="outputs" #outputs></div><div class="controls" #controls></div><div class="inputs" #inputs></div></div>'
  ]);
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
  const selected = scope.editor.selected.contains(scope.node);

  if (this.name !== scope.node.name || this.selected !== selected) {
    this.root.classList.remove(this.name);
    this.root.classList.remove("selected");

    this.root.classList.add(scope.node.name);
    if(selected)
      this.root.classList.add("selected");
  }

  this.selected = selected;

  if (this.name !== scope.node.name) {
    this.name = this.refs.nodeName.nodeValue = scope.node.name;
  }

  if(this.visibleCollapsed !== this.renderedCollapsed){
    if (this.visibleCollapsed) {
      this.refs.collapse.classList.add("closed");
      this.root.classList.add("collapsed");
      this.root.insertBefore(this.refs.inputs, this.refs.collapse);
    } else {
      this.refs.collapse.classList.remove("closed");
      this.root.classList.remove("collapsed");
      this.root.appendChild(this.refs.inputs);
    }
    this.renderedCollapsed = this.visibleCollapsed;
  }

  this.visibleInputs = Array.from(scope.node.inputs.values()).slice();

  keyed(
    "key",
    this.refs.inputs,
    this.renderedInputs,
    this.visibleInputs,
    item => this.getInputComponent(item, scope.node).root,
    (input, item) => {
      input.update(item);
    }
  );

  this.renderedInputs = this.visibleInputs.slice();

  this.visibleOutputs = Array.from(scope.node.outputs.values()).slice();

  keyed(
    "key",
    this.refs.outputs,
    this.renderedOutputs,
    this.visibleOutputs,
    item => {
      return this.getOutputComponent(item, scope.node).root;
    },
    (output, item) => {
      output.update(item);
    }
  );

  this.renderedOutputs = this.visibleOutputs.slice();

  this.visibleControls = Array.from(scope.node.controls.values()).slice();

  keyed(
    "key",
    this.refs.controls,
    this.renderedControls,
    this.visibleControls,
    item => this.getControlComponent(item, scope.node).root,
    (control, item) => {
      control.update(item);
    }
  );

  this.renderedControls = this.visibleControls.slice();
};

extend(NodeComponent, BaseComponent);
