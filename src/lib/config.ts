import * as is from "../utils/is";
import { objEach } from "../utils/fns";
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
        if (is.toType(v) == "Function") {
          _config.customRouteResolve = v;
        }
        break;
      case "route":
        let t = is.toType(v);
        if (t == "String" || t == "Array") {
          let routes = t == "String" ? [v] : v;
          let mainRoute = routes[0];
          routes = routes.map(function (item) {
            return new RegExp(
              "^" +
                item
                  .replace(/^\/?/, "/?")
                  .replace(/[\.]/g, "\\.")
                  .replace(/\$page/g, "([\\w\\-]+)"),
            );
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
        } else {
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

  setConfig: function (key: string | object, value?: any) {
    if (is.isObject(key)) {
      objEach(key, (k, v) => {
        this.set(k, v);
      });
    } else {
      this.set(key, value);
    }
    return this;
  },
};
export default config;
