import { isObject, isArray } from "../utils/is";
let activeEffect = null;
let effectStack: Function[] = [];
const originArrAddMethod = ["push", "pop", "splice", "shift", "unshift"];
let proxyWeakMap = new WeakMap<any, Map<string, Set<Function>>>();
export function effect(fn: Function) {
  activeEffect = fn;
  effectStack.push(fn);
  fn && fn();
  activeEffect = effectStack.pop();
}
export function reactive<T extends object>(obj: T, isShallow?: boolean) {
  return new Proxy(obj, {
    get(target: T, key: string, recevier: any) {
      if (key == "model") {
        return target;
      }
      if (originArrAddMethod.indexOf(key) == -1) {
        trace(target, key);
      }
      let res = <any>Reflect.get(target, key, recevier);
      if (isShallow) {
        return res;
      }
      if (isObject(res)) return reactive(res);
      if (isArray(res)) return reactive(res);
      return res;
    },
    set(target: any, key: string, newV: any, recevier: any) {
      let setResult = Reflect.set(target, key, newV, recevier);
      trigger(target, key);
      return setResult;
    },
  });
}
function trace(target: any, key: string) {
  if (!activeEffect) return;
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
function trigger(target: any, key: string) {
  let depsMap = proxyWeakMap.get(target);
  if (!depsMap) return;
  let events = depsMap.get(key);
  if (!events) return;
  let runEvents = new Set(events);
  runEvents.forEach((fn) => {
    let runResult = fn();
    if (runResult == false) {
      events.delete(fn);
    }
  });
}
