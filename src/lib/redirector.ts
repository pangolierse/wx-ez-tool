/**
 * 对wx.navigateTo、wx.redirectTo、wx.navigateBack的包装，在它们的基础上添加了事件
 */
import { NavigateMethod, NavigateToOption } from "@/types/type";
import config from "./config";
import Emit from "./emit";
const exportee: Emit & Partial<NavigateMethod> = new Emit();
let timer, readyTimer, pending;

exportee.on("page:ready", function () {
  readyTimer = setTimeout(function () {
    pending = false;
  }, 100);
});
function route(type: string, cfg: NavigateToOption, args: any[]) {
  if (pending) return;
  pending = true;
  clearTimeout(timer);
  clearTimeout(readyTimer);
  let routeFrozenTime = config.get("routeFrozenTime");
  /**
   * 避免重复的跳转
   */
  timer = setTimeout(function () {
    pending = false;
  }, routeFrozenTime);
  exportee.emit(type, cfg.url, cfg.params);

  // 会存在不兼容接口，例如：reLaunch
  if (wx[type]) {
    return wx[type].apply(wx, args);
  }
}
exportee.navigateTo = function (cfg) {
  return route("navigateTo", cfg, [].slice.call(arguments));
};
exportee.redirectTo = function (cfg) {
  return route("redirectTo", cfg, [].slice.call(arguments));
};
exportee.switchTab = function (cfg) {
  return route("switchTab", cfg, [].slice.call(arguments));
};
exportee.reLaunch = function (cfg) {
  return route("reLaunch", cfg, [].slice.call(arguments));
};
exportee.navigateBack = function () {
  return wx.navigateBack.apply(wx, [].slice.call(arguments));
};
exportee.redirectDelegate = function (target) {
  ["navigateTo", "redirectTo", "switchTab", "reLaunch", "navigateBack"].map((methodName) => {
    target[methodName] = exportee[methodName];
  });
};
export default exportee;
