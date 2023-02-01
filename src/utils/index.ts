import { isPromise, isString } from "./is";

export function find(list, f) {
  return list.filter(f)[0];
}
export function deepCopy(obj, cache: any[] = []) {
  // just return if obj is immutable value
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const hit = find(cache, (c) => c.original === obj);
  if (hit) {
    return hit.copy;
  }
  const copy = Array.isArray(obj) ? [] : {};
  cache.push({
    original: obj,
    copy,
  });

  Object.keys(obj).forEach((key) => {
    copy[key] = deepCopy(obj[key], cache);
  });

  return copy;
}

// 遍历对象的key，数组再次遍历
export function forEachValue(obj, fn) {
  Object.keys(obj).forEach((key) => fn(obj[key], key));
}

// 返回一个新函数
export function partial(fn, arg) {
  return function () {
    return fn(arg);
  };
}

export function toPromise(fn) {
  if (isPromise(fn)) {
    return fn;
  } else {
    return function () {
      let args = arguments;
      return new Promise((resolve) => {
        resolve(fn.apply(null, args));
      });
    };
  }
}

export function registerHook(list: Array<any>, fn: Function): Function {
  list.push(fn);
  return () => {
    const i = list.indexOf(fn);
    if (i > -1) list.splice(i, 1);
  };
}

export function parseUrlParams(url) {
  const params: Record<string, any> = {};
  if (!isString(url) || url === "") return params;

  url
    .split("?")[1]
    ?.split("&")
    .map((paramsStr) => {
      let [key, value] = paramsStr.split("=");
      params[key] = value;
    });
  return params;
}

export function encryptionParams(params) {
  return encodeURI(JSON.stringify(params));
}
export function decryptParams(paramsUrl: string) {
  try {
    return JSON.parse(decodeURI(paramsUrl));
  } catch {
    return {};
  }
}
