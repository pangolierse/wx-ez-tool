import Module from "./module";
import { forEachValue } from "@/utils/index";
import { assert } from "@/utils/is";
import { StoreModule, StoreRootModule } from "@/types/type";

// 模块收集器 构造模块的树结构 放到 store实例的_modules这个变量中
export default class ModuleCollection {
  root: Module;
  constructor(rawRootModule: StoreRootModule) {
    // 未加工过的模块（用户自定义的），根模块
    this.register([], rawRootModule, false);
  }

  get(path) {
    return path.reduce((module, key) => {
      return module.getChild(key);
    }, this.root);
  }

  // 获取命名空间，最后返回类似 'cart/'
  getNamespace(path) {
    let module = this.root;
    return path.reduce((namespaced, key) => {
      module = module.getChild(key);
      return namespaced + (module.namespaced ? key + "/" : "");
    }, "");
  }

  // 更新模块，用于 热加载 hotUpdate
  // this._modules.update();
  update(rawRootModule) {
    update([], this.root, rawRootModule);
  }

  /**
   * 注册模块
   * @param {Array} path 路径
   * @param {Object} rawModule 原始未加工的模块
   * @param {Boolean} runtime runtime 默认是 true
   */
  register(path: string[], rawModule: StoreRootModule, runtime: boolean = true) {
    // 断言判断用户自定义的模块是否符合要求
    assertRawModule(path, rawModule);
    const newModule = new Module(rawModule, runtime);
    if (path.length === 0) {
      this.root = newModule;
    } else {
      const parent = this.get(path.slice(0, -1));
      parent.addChild(path[path.length - 1], newModule);
    }
    // 递归注册子模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime);
      });
    }
  }

  // 注销模块
  unregister(path) {
    const parent = this.get(path.slice(0, -1));
    const key = path[path.length - 1];
    if (!parent.getChild(key).runtime) return;

    parent.removeChild(key);
  }
}

// 更新
function update(path, targetModule, newModule) {
  targetModule.update(newModule);
  if (newModule.modules) {
    for (const key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        console.warn("热更新时尝试添加了新的模块，若想添加新模块请重新运行编译");
        return;
      }
      update(path.concat(key), targetModule.getChild(key), newModule.modules[key]);
    }
  }
}
// 对象类型
const objectAssert = {
  assert: (value) => typeof value === "function" || (typeof value === "object" && typeof value.handler === "function"),
  expected: "希望接收类型为函数或者带有属性为<handler>的对象",
};

// 用户定义的模块类型
const assertTypes = {
  actions: objectAssert,
};

// 断言未加工的模块，也就是校验用户定义的这些模块是否符合要求。
function assertRawModule(path: string[], rawModule: StoreRootModule) {
  Object.keys(assertTypes).forEach((key) => {
    if (!rawModule[key]) return;

    const assertOptions = assertTypes[key];

    forEachValue(rawModule[key], (value, type) => {
      assert(assertOptions.assert(value), makeAssertionMessage(path, key, type, value, assertOptions.expected));
    });
  });
}

// 生成断言提示消息
function makeAssertionMessage(path, key, type, value, expected) {
  let buf = `${key} should be ${expected} but "${key}.${type}"`;
  if (path.length > 0) {
    buf += ` in module "${path.join(".")}"`;
  }
  buf += ` is ${JSON.stringify(value)}.`;
  return buf;
}
