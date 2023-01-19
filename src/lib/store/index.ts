import { getter, StoreModule, StoreRootModule } from "@/types/type";
import fns from "@/utils/fns";
import { forEachValue } from "@/utils/index";
import { isFunction, isPromise, isObject, assert } from "@/utils/is";
import { reactive, effect } from "../reactive";
import ModuleCollection from "./module/module-collection";
export class Store {
  _actions: Record<string, Function>;
  _modules: ModuleCollection;
  _modulesNamespaceMap: Record<string, string>;
  _wrappedGetters: Record<string, (store: Store) => getter>;
  stateProxy: any;
  constructor(options) {
    this._actions = {};
    // 模块收集器，构造模块树形结构
    this._modules = new ModuleCollection(options);
    // 用于存储模块命名空间的关系
    this._modulesNamespaceMap = Object.create(null);
    // 收集getters
    this._wrappedGetters = Object.create({});
    const store = this;
    const { dispatch } = this;
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload);
    };
    const rootState = this._modules.root.state;
    installModule(this, rootState, [], this._modules.root);
    // 初始化代理state
    const stateProxy = reactive(rootState);
    Object.defineProperty(this, "stateProxy", {
      get() {
        return stateProxy;
      },
    });
  }
  get state() {
    return this.stateProxy;
  }
  set state(v) {
    assert(false, "禁止手动设置state");
  }
  get getters() {
    const store = this;
    let gettersProxy = new Proxy(this._wrappedGetters, {
      get(target, key: string, receiver) {
        assert(isFunction(target[key]), `${key}未被对应模块声明`);
        return Reflect.get(target, key, receiver).bind(receiver, store);
      },
    });
    return gettersProxy;
  }
  // 设置 state 非生产环境报错
  set getters(v) {
    assert(false, "禁止手动设置getter");
  }
  dispatch(_type, _payload) {
    // 获取到type和payload参数
    const { type, payload } = unifyObjectStyle(_type, _payload);

    const entry = this._actions[<string>type];
    // 如果不存在
    if (!entry) {
      // 非生产环境报错，匹配不到 action 类型
      console.error(`【状态管理】查找不到对应action: ${type}`);
      // 不往下执行
      return;
    }

    const result = entry(payload);
    return result.then((res) => {
      return res;
    });
  }
  registerGetters(mapGetter, pageOrComponent, contextData) {
    forEachValue(mapGetter, (type, key) => {
      assert(!contextData.hasOwnProperty(key), `<${pageOrComponent.is}>: getter => ${key}与页面/组件中定义的data冲突`);
      let path = type.split("/").slice(0, -1);
      let value = type.split("/").slice(-1);
      // 断言：当对象中含有Getter声明的属性值时
      assert(!pageOrComponent.hasOwnProperty(type), `<${pageOrComponent.is}>: getter中声明变量与本身属性冲突`);
      // 实现 this.xxx 引用getter
      Object.defineProperty(pageOrComponent, key, {
        get() {
          return pageOrComponent.data[key];
        },
        set() {
          console.error("getter属性不允许直接赋值");
        },
      });
      effect(() => {
        // 获取值触发订阅,经考虑setData的值为纯净对象
        assert(this._wrappedGetters.hasOwnProperty(type), `<${pageOrComponent.is}>: 模块${path}中未声明相关getter：${value}`);
        if (
          (pageOrComponent.$isPageAlive && pageOrComponent.$isPageAlive()) ||
          (pageOrComponent.$isComponentAlive && pageOrComponent.$isComponentAlive())
        ) {
          pageOrComponent.setData({
            [key]: JSON.parse(JSON.stringify(this._wrappedGetters[type](this))),
          });
          return true;
        } else {
          return false;
        }
      });
    });
  }
}
function installModule(store, rootState, path, module, hot?) {
  const isRoot = !path.length;
  const namespaced = store._modules.getNamespace(path);
  if (module.namespaced) {
    // 模块命名空间map对象中已经有了，开发环境报错提示重复
    if (store._modulesNamespaceMap[namespaced]) {
      console.error(`重复命名模块 ${namespaced} ： ${path.join("/")}`);
    }
    store._modulesNamespaceMap[namespaced] = module;
  }
  // set state
  // 不是根模块且不是热重载
  if (!isRoot && !hot) {
    assert(module.namespaced, `模块${path}缺少命名空间属性:namespaced`);
    // 获取父级的state
    const parentState = getNestedState(rootState, path.slice(0, -1));
    // 模块名称
    // 比如 cart
    const moduleName = path[path.length - 1];
    // state 注册
    parentState[moduleName] = module.state;
  }
  const local = (module.context = makeLocalContext(store, namespaced, path));
  // 循环遍历注册 action
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespaced + key;
    const handler = action.handler || action;

    registerAction(store, type, handler, local);
  });
  module.forEachGetter((getter, key) => {
    const namespacedType = namespaced + key;
    registerGetter(store, namespacedType, getter, local);
  });
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
function registerAction(store, type, handler, local) {
  assert(Boolean(store._actions[type]) == false, `模块定义方法冲突:${type}`);
  // payload 是actions函数的第二个参数
  store._actions[type] = function wrappedActionHandler(payload) {
    let res = handler.call(
      store,
      {
        dispatch: local.dispatch,
        state: local.state,
        rootState: store.state,
        rootGetters: store.getters,
      },
      payload,
    );
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    // 然后函数执行结果
    return res;
  };
}
function registerGetter(store, type, rawGetter, local) {
  assert(!store._wrappedGetters[type], `getter ${type} 已经存在`);
  store._wrappedGetters[type] = function wrappedGetter(store) {
    return rawGetter(local.state, local.getters, store.state, store.getters);
  };
}

// 根据路径来获取嵌套的state
function getNestedState(state, path) {
  return path.length ? path.reduce((state, key) => state[key], state) : state;
}

function makeLocalContext(store, namespaced, path) {
  // 声明变量 没有命名空间
  const noNamespace = namespaced === "";

  const local = {
    // 如果没有命名空间就用 store.dispatch 函数
    // 否则添加模块
    dispatch: noNamespace
      ? store.dispatch
      : (_type, _payload, _options) => {
          const args = unifyObjectStyle(_type, _payload, _options);
          let { type, payload, options } = args;
          if (!options || !options.root) {
            // 类型 命名空间字符串拼接
            type = namespaced + type;
          }
          // 返回 store.dispatch
          return store.dispatch(type, payload);
        },
  };
  // 因为它们将被vm update 修改
  Object.defineProperties(local, {
    state: {
      get: () => getNestedState(store.state, path),
    },
  });
  return local;
}
// 统一成对象风格
function unifyObjectStyle(
  type: string | Record<string, any>,
  payload: { root: boolean } | Record<string, any>,
  /**
   * root: 是否是根状态
   */
  options?: { root: boolean } | Record<string, any>,
): {
  type: string;
  payload: Record<string, any>;
  options?: Record<string, any>;
} {
  if (isObject(type) && (<Record<string, any>>type).type) {
    options = <Record<string, any>>payload;
    payload = <Record<string, any>>type;
    type = (<Record<string, any>>type).type;
  }

  // type不是字符串类型，非生产环境报错
  assert(typeof type === "string", `希望接受type类型为string类型，但却接收到 ${typeof type}.`);

  return { type: <string>type, payload: <Record<string, any>>payload, options };
}
export function usePageStore(option, store) {
  option.$store = store;
  option.onLoad = fns.wrapFun(option.onLoad, function () {
    // 挂载全局store
    if (store) {
      if (option.mapGetters) {
        store.registerGetters(option.mapGetters, this, option.data || {});
      }
    }
  });
}
export function useComponentStore(option, store) {
  option.lifetimes.attached = fns.wrapFun(option.lifetimes.attached, function () {
    // 挂载全局store
    if (store) {
      this.$store = store;
      if (option.mapGetters) {
        store.registerGetters(option.mapGetters, this, option.data || {});
      }
    }
  });
}
