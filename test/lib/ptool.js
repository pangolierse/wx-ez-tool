'use strict';

/* 参数是否为undefined */
/* 参数是否为object */
const isObject = (target) => {
    return Object.prototype.toString.call(target).search(/Object/) > -1;
};
/* 参数是否为object */
const isString = (target) => {
    return Object.prototype.toString.call(target).search(/String/) > -1;
};
/* 参数是否为array */
const isArray = (target) => {
    return Object.prototype.toString.call(target).search(/Array/) > -1;
};
const isFunction = (target) => {
    return Object.prototype.toString.call(target).search(/Function/) > -1;
};
const toType = (target) => {
    return Object.prototype.toString.call(target).split(" ")[1].replace("]", "");
};
// 是否为假值（包括对象为空，数组为空）
const isFalse = (target) => {
    if (isArray(target)) {
        if (JSON.stringify(target) == "[]")
            return true;
        else
            return false;
    }
    if (isObject(target)) {
        if (JSON.stringify(target) == "{}")
            return true;
        else
            return false;
    }
    return !Boolean(target);
};
// 断言 不满足 提示错误
const assert = (condition, msg) => {
    if (!condition) {
        throw new Error(`[PT]:${msg}`);
    }
};
// 是否是 Promise
function isPromise(val) {
    return val && typeof val.then === "function";
}

function hasOwn(obj, prop) {
    return obj && obj.hasOwnProperty && obj.hasOwnProperty(prop);
}
function wrapFun(pre, wrapper) {
    return function () {
        try {
            wrapper && wrapper.apply(this, arguments);
        }
        finally {
            pre && pre.apply(this, arguments);
        }
    };
}
function extend(obj, ...args) {
    if (toType(obj) != "Object" && toType(obj) != "Function")
        return obj;
    var source, prop;
    for (var i = 0; i < args.length; i++) {
        source = args[i];
        for (prop in source) {
            if (hasOwn(source, prop)) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
}
function objEach(obj, fn) {
    if (!obj)
        return;
    for (var key in obj) {
        if (hasOwn(obj, key)) {
            if (fn(key, obj[key]) === false)
                break;
        }
    }
}
/**
 *
 * @param queue 执行队列
 * @param fn 迭代器（）
 * @param cb 执行结束回调
 */
function runQueue(queue, fn, cb) {
    const step = (index) => {
        if (index >= queue.length) {
            cb();
        }
        else {
            if (queue[index]) {
                fn(queue[index], () => {
                    step(index + 1);
                });
            }
            else {
                step(index + 1);
            }
        }
    };
    step(0);
}

var fns = /*#__PURE__*/Object.freeze({
  __proto__: null,
  extend: extend,
  hasOwn: hasOwn,
  objEach: objEach,
  runQueue: runQueue,
  wrapFun: wrapFun
});

var PageState;
(function (PageState) {
    PageState[PageState["pendding"] = 0] = "pendding";
    PageState[PageState["loading"] = 1] = "loading";
    PageState[PageState["ready"] = 2] = "ready";
    PageState[PageState["unload"] = 3] = "unload";
})(PageState || (PageState = {}));
var ComponentState;
(function (ComponentState) {
    ComponentState[ComponentState["pendding"] = 0] = "pendding";
    ComponentState[ComponentState["attached"] = 1] = "attached";
    ComponentState[ComponentState["ready"] = 2] = "ready";
    ComponentState[ComponentState["detached"] = 3] = "detached";
})(ComponentState || (ComponentState = {}));
var NavigationFailureType;
(function (NavigationFailureType) {
    NavigationFailureType[NavigationFailureType["redirected"] = 2] = "redirected";
    NavigationFailureType[NavigationFailureType["aborted"] = 4] = "aborted";
    NavigationFailureType[NavigationFailureType["cancelled"] = 8] = "cancelled";
    NavigationFailureType[NavigationFailureType["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));

class Emit {
    constructor(all) {
        this._all = all || new Map();
    }
    on(type, handler) {
        var _a;
        const handlers = (_a = this._all) === null || _a === void 0 ? void 0 : _a.get(type);
        const added = handlers && handlers.push(handler);
        if (!!added == false) {
            this._all.set(type, [handler]);
        }
    }
    off(type, handler) {
        var _a, _b;
        const handlers = (_a = this._all) === null || _a === void 0 ? void 0 : _a.get(type);
        if (!!handler == false) {
            (_b = this._all) === null || _b === void 0 ? void 0 : _b.set(type, null);
        }
        else if (!!handlers) {
            const deleteIndex = handlers.findIndex((fn) => {
                return fn === handler;
            });
            deleteIndex > -1 && handlers.splice(deleteIndex, 1);
        }
    }
    emit(type, ...args) {
        var _a, _b;
        const wildHandler = (_a = this._all) === null || _a === void 0 ? void 0 : _a.get("*");
        const handlers = (_b = this._all) === null || _b === void 0 ? void 0 : _b.get(type);
        wildHandler &&
            wildHandler.forEach((fn) => {
                fn.call(null, type, ...args);
            });
        handlers &&
            handlers.forEach((fn) => {
                fn.apply(null, args);
            });
    }
    clean() {
        this._all.clear();
    }
    assign(target) {
        const msg = this;
        let methods = ["on", "off", "emit"];
        methods.forEach((methodName) => {
            const method = msg[methodName];
            target[methodName] = function () {
                method.apply(msg, arguments);
            };
        });
        return target;
    }
}

// 遍历对象的key，数组再次遍历
function forEachValue(obj, fn) {
    Object.keys(obj).forEach((key) => fn(obj[key], key));
}
function toPromise(fn) {
    if (isPromise(fn)) {
        return fn;
    }
    else {
        return function () {
            let args = arguments;
            return new Promise((resolve) => {
                resolve(fn.apply(null, args));
            });
        };
    }
}
function registerHook(list, fn) {
    list.push(fn);
    return () => {
        const i = list.indexOf(fn);
        if (i > -1)
            list.splice(i, 1);
    };
}
function parseUrlParams(url) {
    var _a;
    const params = {};
    if (!isString(url) || url === "")
        return params;
    (_a = url
        .split("?")[1]) === null || _a === void 0 ? void 0 : _a.split("&").map((paramsStr) => {
        let [key, value] = paramsStr.split("=");
        params[key] = value;
    });
    return params;
}
function encryptionParams(params) {
    return encodeURIComponent(JSON.stringify(params));
}
function decryptParams(paramsUrl) {
    try {
        return JSON.parse(decodeURIComponent(paramsUrl));
    }
    catch (_a) {
        return {};
    }
}

let activeEffect = null;
let effectStack = [];
const originArrAddMethod = ["push", "pop", "splice", "shift", "unshift"];
let proxyWeakMap = new WeakMap();
function effect(fn) {
    activeEffect = fn;
    effectStack.push(fn);
    fn && fn();
    activeEffect = effectStack.pop();
}
function reactive(obj, isShallow) {
    return new Proxy(obj, {
        get(target, key, recevier) {
            if (key == "model") {
                return target;
            }
            if (originArrAddMethod.indexOf(key) == -1) {
                trace(target, key);
            }
            let res = Reflect.get(target, key, recevier);
            if (isShallow) {
                return res;
            }
            if (isObject(res))
                return reactive(res);
            if (isArray(res))
                return reactive(res);
            return res;
        },
        set(target, key, newV, recevier) {
            let setResult = Reflect.set(target, key, newV, recevier);
            trigger(target, key);
            return setResult;
        },
    });
}
function trace(target, key) {
    if (!activeEffect)
        return;
    let depsMap = proxyWeakMap.get(target);
    if (!depsMap) {
        proxyWeakMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
}
// 进行特化处理，当effect方法返回结果为false时，移除当前set中的对应成员
function trigger(target, key) {
    let depsMap = proxyWeakMap.get(target);
    if (!depsMap)
        return;
    let events = depsMap.get(key);
    if (!events)
        return;
    let runEvents = new Set(events);
    runEvents.forEach((fn) => {
        let runResult = fn();
        if (runResult == false) {
            events.delete(fn);
        }
    });
}

// store 的模块 基础数据结构，包括一些属性和方法
class Module {
    constructor(rawModule, runtime) {
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
        return !!this._rawModule.namespaced;
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
        this._rawModule.namespaced = rawModule.namespaced;
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

// 模块收集器 构造模块的树结构 放到 store实例的_modules这个变量中
class ModuleCollection {
    constructor(rawRootModule) {
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
    register(path, rawModule, runtime = true) {
        // 断言判断用户自定义的模块是否符合要求
        assertRawModule(path, rawModule);
        const newModule = new Module(rawModule, runtime);
        if (path.length === 0) {
            this.root = newModule;
        }
        else {
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
        if (!parent.getChild(key).runtime)
            return;
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
function assertRawModule(path, rawModule) {
    Object.keys(assertTypes).forEach((key) => {
        if (!rawModule[key])
            return;
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

class Store {
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
            get(target, key, receiver) {
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
        const entry = this._actions[type];
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
                if ((pageOrComponent.$isPageAlive && pageOrComponent.$isPageAlive()) ||
                    (pageOrComponent.$isComponentAlive && pageOrComponent.$isComponentAlive())) {
                    pageOrComponent.setData({
                        [key]: JSON.parse(JSON.stringify(this._wrappedGetters[type](this))),
                    });
                    return true;
                }
                else {
                    return false;
                }
            });
        });
    }
}
function installModule(store, rootState, path, module, hot) {
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
        let res = handler.call(store, {
            dispatch: local.dispatch,
            state: local.state,
            rootState: store.state,
            rootGetters: store.getters,
        }, payload);
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
function unifyObjectStyle(type, payload, 
/**
 * root: 是否是根状态
 */
options) {
    if (isObject(type) && type.type) {
        options = payload;
        payload = type;
        type = type.type;
    }
    // type不是字符串类型，非生产环境报错
    assert(typeof type === "string", `希望接受type类型为string类型，但却接收到 ${typeof type}.`);
    return { type: type, payload: payload, options };
}
function usePageStore(option, store) {
    option.$store = store;
    option.onLoad = wrapFun(option.onLoad, function () {
        // 挂载全局store
        if (store) {
            if (option.mapGetters) {
                store.registerGetters(option.mapGetters, this, option.data || {});
            }
        }
    });
}
function useComponentStore(option, store) {
    option.lifetimes.attached = wrapFun(option.lifetimes.attached, function () {
        // 挂载全局store
        if (store) {
            this.$store = store;
            if (option.mapGetters) {
                store.registerGetters(option.mapGetters, this, option.data || {});
            }
        }
    });
}

const emit = new Emit();
const _dispatcher = new Emit();
const state = {
    // 组件ID:__wxExparserNodeId__
    refs: {},
    // APP 隐藏时间
    hideTime: 0,
    // 一次性缓存（即存即用）
    channel: new Map(),
    store: null,
    eventBus: emit,
};
const stateProxy = new Proxy(state, {
    get(target, p, receiver) {
        return Reflect.get(target, p, receiver);
    },
    set() {
        assert(false, "禁止直接修改工具全局状态，如需修改请使用抛出的方法修改");
        return true;
    },
});
const dispatcher = _dispatcher.assign({
    getRef(id) {
        return state.refs[id];
    },
    deleteRef(id) {
        delete state.refs[id];
    },
    setRef(id, ref) {
        state.refs[id] = ref;
    },
    updateHideTime(time) {
        state.hideTime = time;
    },
    put(key, value) {
        state.channel[key] = value;
    },
    take(key) {
        var v = state.channel[key];
        // 释放引用
        state.channel[key] = null;
        return v;
    },
    createStore(store) {
        state.store = new Store(store);
    },
});

const _config = {
    routeFrozenTime: 2000,
    nameResolve: null,
    routeResolve: null,
    customRouteResolve: null,
};
const config = {
    set: function (k, v) {
        switch (k) {
            case "resolvePath":
                if (toType(v) == "Function") {
                    _config.customRouteResolve = v;
                }
                break;
            case "route":
                let t = toType(v);
                if (t == "String" || t == "Array") {
                    let routes = t == "String" ? [v] : v;
                    let mainRoute = routes[0];
                    routes = routes.map(function (item) {
                        return new RegExp("^" +
                            item
                                .replace(/^\/?/, "/?")
                                .replace(/[\.]/g, "\\.")
                                .replace(/\$page/g, "([\\w\\-]+)"));
                    });
                    _config.routeResolve = function (name) {
                        return mainRoute.replace(/\$page/g, name);
                    };
                    _config.nameResolve = function (url) {
                        var n = "";
                        routes.some(function (reg) {
                            var m = reg.exec(url);
                            if (m) {
                                n = m[1];
                                return true;
                            }
                        });
                        return n;
                    };
                }
                else {
                    console.error("Illegal routes option:", v);
                }
                break;
            default:
                _config[k] = v;
        }
    },
    get: function (k) {
        return _config[k];
    },
    setConfig: function (key, value) {
        if (isObject(key)) {
            objEach(key, (k, v) => {
                this.set(k, v);
            });
        }
        else {
            this.set(key, value);
        }
        return this;
    },
};

function createNavigationRedirectError(to, from) {
    return createRouterError(from, to, NavigationFailureType.redirected, `[PTool]:当${from.url}跳转到${to.url}时由守卫执行了重定向`);
}
function createNavigationAbortedError(to, from) {
    return createRouterError(from, to, NavigationFailureType.aborted, `[PTool]:当${from.url}跳转到${to.url}时由守卫中断了跳转`);
}
function createNavigationCancelledError(from, to) {
    return createRouterError(from, to, NavigationFailureType.cancelled, `[PTool]:跳转取消 = (${from.url} => ${to.url}),执行新的跳转`);
}
function createNavigationDuplicatedError(from, to) {
    const error = createRouterError(from, to, NavigationFailureType.duplicated, `[PTool]:避免重复跳转同一个页面，当前重复跳转页面路径 => "${from.url}".`);
    // backwards compatible with the first introduction of Errors
    error.name = "NavigationDuplicated";
    return error;
}
function createRouterError(from, to, type, message) {
    const error = { message };
    error._isRouter = true;
    error.from = from;
    error.to = to;
    error.type = type;
    return error;
}

class Router extends Emit {
    constructor() {
        super();
        this.errorCbs = [];
        this.beforeRoute = [];
        this.afterRoute = [];
    }
    navigateTo(cfg) {
        return this.route("navigateTo", cfg, [].slice.call(arguments));
    }
    redirectTo(cfg) {
        return this.route("redirectTo", cfg, [].slice.call(arguments));
    }
    switchTab(cfg) {
        return this.route("switchTab", cfg, [].slice.call(arguments));
    }
    reLaunch(cfg) {
        return this.route("reLaunch", cfg, [].slice.call(arguments));
    }
    navigateBack(cfg) {
        this.emit("navigateBack", "", cfg.params);
        return wx["navigateBack"].apply(wx, [].slice.call(arguments));
    }
    route(type, cfg, args) {
        if (cfg.name) {
            cfg.url = bridge.getPageUrlByName(cfg.name);
        }
        const currentPageUrl = bridge.getPage().route;
        const route = { url: cfg.url, name: bridge.getPageName(cfg.url) };
        const current = { url: currentPageUrl, name: bridge.getPageName(currentPageUrl) };
        const abort = (err) => {
            if (this.errorCbs.length) {
                this.errorCbs.forEach((errFn) => {
                    errFn(err);
                });
            }
            else {
                console.warn(err);
            }
            cfg.fail && cfg.fail(err);
        };
        if (cfg.url == "/" + currentPageUrl) {
            return abort(createNavigationDuplicatedError(current, route));
        }
        this.pendding = cfg;
        const iterator = (hook, next) => {
            if (this.pendding !== cfg) {
                return abort(createNavigationCancelledError(current, route));
            }
            hook(route, current, (to) => {
                // 终止跳转且后续守卫不执行
                if (to === false) {
                    abort(createNavigationAbortedError(current, route));
                    // do nothing
                }
                else if (isObject(to) && (isString(to.url) || isString(to.name))) {
                    // 中断原有跳转改为跳转到其他地方
                    to = to;
                    if (isObject(to) && to.replace) {
                        this.redirectTo(to);
                    }
                    else {
                        try {
                            this.navigateTo(to);
                        }
                        catch (_a) {
                            this.switchTab(to);
                        }
                    }
                    abort(createNavigationRedirectError(current, route));
                }
                else {
                    next(to);
                }
            });
        };
        runQueue(this.beforeRoute, iterator, () => {
            this.emit(type, cfg.url, cfg.params);
            this.pendding = null;
            // 会存在不兼容接口，例如：reLaunch
            if (wx[type]) {
                return wx[type].apply(wx, args);
            }
        });
    }
    redirectDelegate(target) {
        ["navigateTo", "redirectTo", "switchTab", "reLaunch", "navigateBack"].map((methodName) => {
            target[methodName] = this[methodName];
        });
    }
    beforeEach(fn) {
        return registerHook(this.beforeRoute, fn);
    }
    afterEach(fn) {
        return registerHook(this.afterRoute, fn);
    }
    onError(fn) {
        this.errorCbs.push(fn);
    }
}
const router = new Router();

const navigate = route({ type: "navigateTo" });
const redirect = route({ type: "redirectTo" });
const switchTab = route({ type: "switchTab" });
const reLaunch = route({ type: "reLaunch" });
const navigateBack = (option) => {
    router.navigateBack(option);
};
var bridge = {
    redirectDelegate: function (emitter, dispatcher) {
        ["navigateTo", "redirectTo", "switchTab", "reLaunch", "navigateBack"].forEach(function (k) {
            emitter.on(k, function (url, params) {
                let name;
                if (k === "navigateBack") {
                    let backPage = getCurrentPages()[getCurrentPages().length - 2];
                    if (backPage) {
                        name = getPageName("/" + backPage.route);
                    }
                }
                else {
                    name = getPageName(url);
                }
                name && dispatcher.emit(k + ":" + name, url, params);
            });
        });
    },
    mountRef: function (e) {
        let componentID = e.detail;
        let ref = dispatcher.getRef(componentID);
        if (!ref)
            return;
        let refName = ref._$ref;
        if (refName && this.$refs) {
            this.$refs[refName] = ref;
        }
        ref._$attached(this);
    },
    methods: function (ctx) {
        // 组件快速调用
        ctx.$refs = {};
        // 一次性存取
        ctx.$put = dispatcher.put;
        ctx.$take = dispatcher.take;
        /**
         * 路由方法
         */
        ctx.$route = ctx.$navigate = navigate;
        ctx.$redirect = redirect;
        ctx.$switch = switchTab;
        ctx.$reLaunch = reLaunch;
        ctx.$back = navigateBack;
        /**
         * 页面预加载
         */
        ctx.$preload = preload;
        /**
         * 页面信息
         */
        ctx.$curPage = getPage;
        ctx.$curPageName = curPageName;
    },
    getPageUrlByName,
    getPageName,
    getPage,
};
function route({ type }) {
    return function (url, option = {}) {
        const pagepath = getPageUrlByName(url);
        const params = parseUrlParams(url);
        if (params.encodeData) {
            option.params = Object.assign(decryptParams(params.encodeData), option.params);
            delete params.encodeData;
        }
        // append querystring
        const query = Object.entries(params)
            .map((item) => item.join("="))
            .join("&");
        option.url = `${pagepath}${!isFalse(option) ? "?encodeData=" + encryptionParams(option.params) : ""}${query ? "&" + query : ""}`;
        router[type](option);
    };
}
function preload(url, params) {
    var name = getPageName(url);
    name && dispatcher && dispatcher.emit("preload:" + name, url, params);
}
function getPageUrlByName(url) {
    var parts = url.split(/\?/);
    var pagepath = parts[0];
    if (/^[\w\-]+$/.test(pagepath)) {
        pagepath = (config.get("customRouteResolve") || config.get("routeResolve"))(pagepath);
    }
    if (!pagepath) {
        // @ts-ignore
        throw new Error("Invalid path:", pagepath);
    }
    return pagepath;
}
function getPage() {
    return getCurrentPages().slice(0).pop();
}
function getPageName(url) {
    var m = /^[\w\-]+(?=\?|$)/.exec(url);
    return m ? m[0] : config.get("nameResolve")(url);
}
function curPageName() {
    var route = getPage().route;
    if (!route)
        return "";
    return getPageName(route);
}

const defaultState = { lifeState: PageState.pendding, preloadFn: null };
const namePool = {};
// 总事件管理
function IPage(name, option) {
    if (isObject(name)) {
        option = name;
        name = option.name || "_unknow";
    }
    if (namePool[name] && name !== "_unknow") {
        assert(true, `存在重名路由${name}，请确认该路径名称是否重复 // PS：目前没找到更好的页面名称设置的逻辑，如果有更好的思路欢迎到https://github.com/pangolierse/wx-ez-tool提`);
    }
    else {
        namePool[name] = true;
    }
    option.$name = name;
    option.$state = JSON.parse(JSON.stringify(defaultState));
    // 页面是否存活
    option.$isPageAlive = function () {
        var _a;
        return ((_a = this.$state) === null || _a === void 0 ? void 0 : _a.lifeState) !== PageState.unload;
    };
    // 若项目声明了状态管理器则对每个页面进行检测
    if (stateProxy.store) {
        usePageStore(option, stateProxy.store);
    }
    loadBeforePageInitExtend(option);
    if (option.onNavigate) {
        assert(name !== "_unknow", "用到onNavigate方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
        let onNavigateHandler = function (url, params) {
            option.onNavigate({ url, params });
        };
        console.log(`Page[${name}] define "onNavigate"`);
        dispatcher.on(`navigateTo:${name}`, onNavigateHandler);
        dispatcher.on(`redirectTo:${name}`, onNavigateHandler);
        dispatcher.on(`switchTabTo:${name}`, onNavigateHandler);
        dispatcher.on(`reLaunchTo:${name}`, onNavigateHandler);
    }
    if (option.onBack) {
        assert(name !== "_unknow", "用到onBack方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
        console.log(`Page[${name}] define "onBack"`);
    }
    option.onLoad = wrapFun(option.onLoad, function (onLoadOption) {
        // Back方法特殊处理可能需要获取到页面实例，所以放在onLoad的时候注册
        if (option.onBack) {
            let onNavigateBackHandler = (url, params) => {
                this.onBack(params);
            };
            dispatcher.on(`navigateBack:${name}`, onNavigateBackHandler);
        }
        if (onLoadOption === null || onLoadOption === void 0 ? void 0 : onLoadOption.encodeData) {
            // 转化页面参数
            onLoadOption.params = decryptParams(onLoadOption.encodeData);
            delete onLoadOption.encodeData;
        }
        // 防止 热更新时页面报错
        if (!!this.$state == false) {
            this.$state = JSON.parse(JSON.stringify(defaultState));
        }
        this.$state.lifeState = PageState.loading;
        option.onAwake &&
            dispatcher.on("app:sleep", (t) => {
                option.onAwake.call(this, t);
            });
    });
    /**
     * preload lifecycle method
     */
    if (option.onPreload) {
        assert(name !== "_unknow", "用到onPreload方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
        console.log(`Page[${name}] define "onPreload"`);
        dispatcher.on("preload:" + name, function (url, params) {
            option.onPreload = toPromise(option.onPreload);
            option.$state.preloadFn = option.onPreload({ url, params });
        });
        // preload将在onLoad时等待完成
        option.onLoad = wrapFun(option.onLoad, function () {
            this.$state = this.$state || {};
            if (this.$state.preloadFn) {
                this.$state.preloadFn
                    .then((...args) => {
                    option.onPreloaded(...args);
                })
                    .catch((err) => {
                    console.log("页面在预加载时出错：", err);
                });
            }
        });
    }
    bridge.methods(option);
    option.$m = bridge.mountRef;
    option.onReady = wrapFun(option.onReady, function () {
        this.$state.lifeState = PageState.ready;
        router.emit("page:ready");
    });
    option.onUnload = wrapFun(option.onUnload, function () {
        this.$state.lifeState = PageState.unload;
        router.emit("page:unload");
    });
    if ("onPageLaunch" in option) {
        option.onPageLaunch();
    }
    loadafterPageInitExtend(option);
    return Page(option);
}
function loadBeforePageInitExtend(option) {
    const beforePageInitExtend = config.get("beforePageInitExtend") || null;
    if (beforePageInitExtend) {
        assert(isFunction(beforePageInitExtend), "beforePageInitExtend 必须为函数");
        beforePageInitExtend({
            option,
            fns,
            state: stateProxy,
            dispatcher,
        });
    }
}
function loadafterPageInitExtend(option) {
    const afterPageInitExtend = config.get("afterPageInitExtend") || null;
    if (afterPageInitExtend) {
        assert(isFunction(afterPageInitExtend), "afterPageInitExtend 必须为函数");
        afterPageInitExtend({
            option,
            fns,
            state: stateProxy,
            dispatcher,
        });
    }
}

// @ts-ignore
function IApp(option) {
    var _a, _b;
    assert(!!((_b = (_a = option === null || option === void 0 ? void 0 : option.config) === null || _a === void 0 ? void 0 : _a.route) === null || _b === void 0 ? void 0 : _b.length), "config.route is necessary !!!");
    if (option.config) {
        config.setConfig(option.config);
    }
    var ctx = option;
    /**
     * APP sleep logical
     */
    option.onLaunch = wrapFun(option.onLaunch, function () {
        this.$store = stateProxy.store;
    });
    option.onShow = option.onShow ? wrapFun(option.onShow, appShowHandler) : appShowHandler;
    option.onHide = option.onHide ? wrapFun(option.onHide, appHideHandler) : appHideHandler;
    option.onLaunch = wrapFun(option.onLaunch, function () {
        ctx = this;
    });
    if (option.onAwake) {
        dispatcher.on("app:sleep", function (t) {
            option.onAwake.call(ctx, t);
        });
    }
    App(option);
}
function appShowHandler() {
    if (!stateProxy.hideTime)
        return;
    let t = stateProxy.hideTime;
    dispatcher.updateHideTime(0);
    dispatcher.emit("app:sleep", new Date().getTime() - t);
}
function appHideHandler() {
    dispatcher.updateHideTime(new Date().getTime());
}

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

const PTool = {
    Page: IPage,
    Component: IComponent,
    App: IApp,
    router: router,
    createStore: dispatcher.createStore,
};
Object.defineProperty(PTool, "store", {
    get() {
        return stateProxy.store;
    },
    configurable: false,
});
stateProxy.eventBus.assign(PTool);
bridge.redirectDelegate(router, dispatcher);
router.redirectDelegate(PTool);
// 自动注入PTool到全局
Object.defineProperty(Object.prototype, "PTool", {
    value: PTool,
    configurable: false,
    enumerable: false,
});

module.exports = PTool;
