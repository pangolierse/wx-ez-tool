import fns from "../utils/fns";
import { isObject, assert } from "../utils/is";
import { PageState } from "./const";
import { dispatcher, stateProxy } from "./state";
import bridge from "./bridge";
import redirector from "./redirector";
import { usePageStore } from "./store/index";
// 总事件管理
function IPage(name, option) {
  if (isObject(name)) {
    option = name;
    name = option.name || "_unknow";
  }
  option.$name = name;
  option.$state = { lifeState: PageState.pendding };
  // 页面是否存活
  option.$isPageAlive = function () {
    return this.$state.lifeState !== PageState.unload;
  };
  // 若项目声明了状态管理器则对每个页面进行检测
  if (stateProxy.store) {
    usePageStore(option, stateProxy.store);
  }
  if (option.onNavigate) {
    let onNavigateHandler = function (url, params) {
      option.onNavigate({ url, params });
    };
    assert(name !== "_unknow", "用到onNavigate方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
    console.log(`Page[${name}] define "onNavigate"`);
    dispatcher.on(`navigateTo:${name}`, onNavigateHandler);
    dispatcher.on(`redirectTo:${name}`, onNavigateHandler);
    dispatcher.on(`switchTabTo:${name}`, onNavigateHandler);
    dispatcher.on(`reLaunchTo:${name}`, onNavigateHandler);
  }
  /**
   * preload lifecycle method
   */
  if (option.onPreload) {
    assert(name !== "_unknow", "用到onPreload方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
    console.log(`Page[${name}] define "onPreload"`);
    dispatcher.on("preload:" + name, function (url, params) {
      option.onPreload({ url, params });
    });
  }
  option.onLoad = fns.wrapFun(option.onLoad, function (onLoadOption) {
    if (onLoadOption.encodeData) {
      // 转化页面参数
      onLoadOption.params = JSON.parse(decodeURI(onLoadOption.encodeData));
      delete onLoadOption.encodeData;
    }
    this.$state.lifeState = PageState.loading;
    option.onAwake &&
      dispatcher.on("app:sleep", (t) => {
        option.onAwake.call(this, t);
      });
  });
  bridge.methods(option);
  option.$m = bridge.mountRef;
  option.onReady = fns.wrapFun(option.onReady, function () {
    this.$state.lifeState = PageState.ready;
    redirector.emit("page:ready");
  });
  option.onUnload = fns.wrapFun(option.onReady, function () {
    this.$state.lifeState = PageState.unload;
    redirector.emit("page:unload");
  });
  if ("onPageLaunch" in option) {
    option.onPageLaunch();
  }

  return Page(option);
}
export default IPage;
