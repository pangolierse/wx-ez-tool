import { StoreModule, StoreRootModule } from "@/types/type";
import { forEachValue } from "@/utils/index";
// store 的模块 基础数据结构，包括一些属性和方法

export default class Module {
  runtime: string;
  _children: {};
  _rawModule: StoreModule | StoreRootModule;
  state: Record<string, any>;
  constructor(rawModule: StoreModule | StoreRootModule, runtime) {
    // 接收参数 runtime
    this.runtime = runtime;
    // 存储子模块
    this._children = Object.create(null);
    // 存储原始未加工的模块
    this._rawModule = rawModule;
    // 模块 state
    const rawState = rawModule.state;
    this.state = rawState || {};
  }
  // 获取是否区分命名空间 namespaced，也就是用户自定义的namespaced
  get namespaced() {
    return !!(<StoreModule>this._rawModule).namespaced;
  }
  // 添加子模块
  addChild(key, module) {
    this._children[key] = module;
  }
  // 删除子模块
  removeChild(key) {
    delete this._children[key];
  }
  // 获取子模块
  getChild(key) {
    return this._children[key];
  }
  // 更新模块，用于 热加载 hotUpdate
  // 把 原始模块作为参数，分别赋值namespaced、actions、mutations、getters
  update(rawModule) {
    (<StoreModule>this._rawModule).namespaced = rawModule.namespaced;
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions;
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters;
    }
  }

  // 遍历 子模块
  forEachChild(fn) {
    forEachValue(this._children, fn);
  }

  // 遍历 用户自定义的 action
  forEachGetter(fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn);
    }
  }

  // 遍历 用户自定义的 action
  forEachAction(fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  }
}
