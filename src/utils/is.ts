/* 参数是否为undefined */
export const isUndefined = (target) => {
  return Object.prototype.toString.call(target).search(/Undefined/) > -1;
};
/* 参数是否为null */
export const isNull = (target) => {
  return Object.prototype.toString.call(target).search(/Null/) > -1;
};
export const isBoolean = (target) => {
  return Object.prototype.toString.call(target).search(/Boolean/) > -1;
};
/* 参数是否为object */
export const isObject = (target) => {
  return Object.prototype.toString.call(target).search(/Object/) > -1;
};
/* 参数是否为array */
export const isArray = (target) => {
  return Object.prototype.toString.call(target).search(/Array/) > -1;
};
export const isFunction = (target) => {
  return Object.prototype.toString.call(target).search(/Function/) > -1;
};
export const toType = (target) => {
  return Object.prototype.toString.call(target).split(' ')[1].replace(']', '');
};
// 是否为假值（包括对象为空，数组为空）
export const isFalse = (target) => {
  if (isArray(target)) {
    if (JSON.stringify(target) == '[]') return true;
    else return false;
  }
  if (isObject(target)) {
    if (JSON.stringify(target) == '{}') return true;
    else return false;
  }
  return !Boolean(target);
};
// 断言 不满足 提示错误
export const assert = (condition, msg) => {
  if (!condition) {
    throw new Error(`[PT]:${msg}`);
  }
};
// 是否是 Promise
export function isPromise(val) {
  return val && typeof val.then === 'function';
}