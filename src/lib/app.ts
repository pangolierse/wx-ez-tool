import { wrapFun } from "../utils/fns";
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
  if (!stateProxy.hideTime) return;
  let t = stateProxy.hideTime;
  dispatcher.updateHideTime(0);
  dispatcher.emit("app:sleep", new Date().getTime() - t);
}
function appHideHandler() {
  dispatcher.updateHideTime(new Date().getTime());
}

export default IApp;
