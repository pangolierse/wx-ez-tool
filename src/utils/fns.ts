import { toType } from "./is";

function hasOwn(obj, prop) {
  return obj && obj.hasOwnProperty && obj.hasOwnProperty(prop);
}
export default {
  wrapFun: function (pre, wrapper) {
    return function () {
      try {
        wrapper && wrapper.apply(this, arguments);
      } finally {
        pre && pre.apply(this, arguments);
      }
    };
  },
  extend: function (obj, ...args) {
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
  },
  objEach: function (obj, fn) {
    if (!obj) return;
    for (var key in obj) {
      if (hasOwn(obj, key)) {
        if (fn(key, obj[key]) === false) break;
      }
    }
  },
};
