/**
 * 对wx.navigateTo、wx.redirectTo、wx.navigateBack的包装，在它们的基础上添加了事件
 */
import { BackToOption, NavigateToOption, NavigationGuard, NavigationGuardNext, Route } from "@/types/type";
import { registerHook } from "@/utils/index";
import {
  createNavigationCancelledError,
  createNavigationDuplicatedError,
  createNavigationAbortedError,
  createNavigationRedirectError,
} from "@/utils/errors";
import { runQueue } from "@/utils/fns";
import { isObject, isString } from "@/utils/is";
import bridge from "./bridge";
import config from "./config";
import Emit from "./emit";
type routeMethod = "navigateTo" | "redirectTo" | "switchTab" | "reLaunch" | "navigateBack";
class Router extends Emit {
  beforeRoute: Function[];
  afterRoute: Function[];
  errorCbs: Function[];
  timer: number;
  readyTimer;
  pendding;
  constructor() {
    super();
    this.errorCbs = [];
    this.beforeRoute = [];
    this.afterRoute = [];
  }
  navigateTo(cfg: NavigateToOption) {
    return this.route("navigateTo", cfg, [].slice.call(arguments));
  }
  redirectTo(cfg: NavigateToOption) {
    return this.route("redirectTo", cfg, [].slice.call(arguments));
  }
  switchTab(cfg: NavigateToOption) {
    return this.route("switchTab", cfg, [].slice.call(arguments));
  }
  reLaunch(cfg: NavigateToOption) {
    return this.route("reLaunch", cfg, [].slice.call(arguments));
  }
  navigateBack(cfg: BackToOption) {
    this.emit("navigateBack", "", cfg.params);
    return wx["navigateBack"].apply(wx, [].slice.call(arguments));
  }
  route(type: routeMethod, cfg: NavigateToOption, args: any[]) {
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
      } else {
        console.warn(err);
      }
      cfg.fail && cfg.fail(err);
    };
    if (cfg.url == "/" + currentPageUrl) {
      return abort(createNavigationDuplicatedError(current, route));
    }
    this.pendding = cfg;
    const iterator = (hook: NavigationGuard, next: NavigationGuardNext) => {
      if (this.pendding !== cfg) {
        return abort(createNavigationCancelledError(current, route));
      }
      hook(route, current, (to: Route | false | void) => {
        // 终止跳转且后续守卫不执行
        if (to === false) {
          abort(createNavigationAbortedError(current, route));
          // do nothing
        } else if (isObject(to) && (isString((<Route>to).url) || isString((<Route>to).name))) {
          // 中断原有跳转改为跳转到其他地方
          to = <Route>to;
          if (isObject(to) && (<Route>to).replace) {
            this.redirectTo(to);
          } else {
            try {
              this.navigateTo(<Route>to);
            } catch {
              this.switchTab(<Route>to);
            }
          }
          abort(createNavigationRedirectError(current, route));
        } else {
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
  beforeEach(fn: NavigationGuard) {
    return registerHook(this.beforeRoute, fn);
  }
  afterEach(fn: NavigationGuard) {
    return registerHook(this.afterRoute, fn);
  }
  onError(fn) {
    this.errorCbs.push(fn);
  }
}

const router = new Router();
export default router;
