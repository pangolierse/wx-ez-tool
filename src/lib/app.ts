import fns from "../utils/fns";
import config from "./config";
import { assert } from "../utils/is";
import { stateProxy, dispatcher } from "./state";
// @ts-ignore
function IApp(option) {
  assert(!!option?.config?.route?.length, "config.route is necessary !!!");
  if (option.config) {
    config.setConfig(option.config);
  }
  var ctx = option;
  /**
   * APP sleep logical
   */
  option.onShow = option.onShow ? fns.wrapFun(option.onShow, appShowHandler) : appShowHandler;
  option.onHide = option.onHide ? fns.wrapFun(option.onHide, appHideHandler) : appHideHandler;
  option.onLaunch = fns.wrapFun(option.onLaunch, function () {
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
  if (!stateProxy.hideTime) return;
  let t = stateProxy.hideTime;
  dispatcher.updateHideTime(0);
  dispatcher.emit("app:sleep", new Date().getTime() - t);
}
function appHideHandler() {
  dispatcher.updateHideTime(new Date().getTime());
}

export default IApp;
