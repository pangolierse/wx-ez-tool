import { toType } from "./is";

export function hasOwn(obj, prop) {
  return obj && obj.hasOwnProperty && obj.hasOwnProperty(prop);
}
export function wrapFun(pre, wrapper) {
  return function () {
    try {
      wrapper && wrapper.apply(this, arguments);
    } finally {
      pre && pre.apply(this, arguments);
    }
  };
}
export function extend(obj, ...args) {
  if (toType(obj) != "Object" && toType(obj) != "Function") return obj;
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
export function objEach(obj, fn) {
  if (!obj) return;
  for (var key in obj) {
    if (hasOwn(obj, key)) {
      if (fn(key, obj[key]) === false) break;
    }
  }
}
/**
 *
 * @param queue 执行队列
 * @param fn 迭代器（）
 * @param cb 执行结束回调
 */
export function runQueue<T extends Array<Function>>(queue: T, fn: Function, cb: Function) {
  const step = (index) => {
    if (index >= queue.length) {
      cb();
    } else {
      if (queue[index]) {
        fn(queue[index], () => {
          step(index + 1);
        });
      } else {
        step(index + 1);
      }
    }
  };
  step(0);
}
