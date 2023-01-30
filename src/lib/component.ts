import { extend, wrapFun } from "../utils/fns";
import { ComponentState } from "./const";
import bridge from "./bridge";
import { dispatcher, stateProxy } from "./state";
import { useComponentStore } from "./store/index";

function IComponent(option) {
  option.$state = {};
  option.$state.lifeState = ComponentState.pendding;
  option.lifetimes = option.lifetimes || {};
  // 若项目声明了状态管理器则对每个页面进行检测
  if (stateProxy.store) {
    useComponentStore(option, stateProxy.store);
  }
  option.properties = extend({}, option.properties, {
    ref: {
      type: String,
      value: "",
      observer: function (next) {
        /**
         * 支持动态 ref
         */
        if (this._$ref !== next) {
          let $refs = this.$parent && this.$parent.$refs;
          if ($refs) {
            let ref = $refs[this._$ref];
            delete $refs[this._$ref];
            this._$ref = next;
            if (ref && next) {
              $refs[next] = ref;
            }
          }
        }
      },
    },
  });
  option.lifetimes.attached = wrapFun(option.lifetimes.attached, function () {
    bridge.methods && bridge.methods(this);
    this.$state = option.$state;
    this.$state.lifeState = ComponentState.attached;
    this.$id = this.__wxExparserNodeId__;
    dispatcher.setRef(this.$id, this);
    this._$ref = this.properties.ref || this.properties._ref;
    this.$isComponentAlive = function () {
      return this.$state.lifeState !== ComponentState.detached;
    };
    this.triggerEvent("mount", this.$id);
  });
  option.lifetimes.ready = wrapFun(option.lifetimes.ready, function () {
    this.$state = this.$state || {};
    this.$state.lifeState = ComponentState.ready;
  });
  option.lifetimes.detached = wrapFun(option.lifetimes.detached, function () {
    dispatcher.deleteRef(this.$id);
    let $refs = this.$parent && this.$parent.$refs;
    let refName = this._$ref;
    if (refName && $refs) {
      delete $refs[refName];
    }
    this.$parent = null;
    this.$state.lifeState = ComponentState.detached;
  });
  option.methods = extend({}, option.methods, {
    _$attached: function (parent) {
      this.$root = parent.$root || parent;
      this.$parent = parent;
    },
    $m: bridge.mountRef,
  });
  return Component(option);
}
export default IComponent;
