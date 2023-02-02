import { wrapFun } from "../utils/fns";
import { isObject, assert } from "../utils/is";
import { PageState } from "./const";
import { dispatcher, stateProxy } from "./state";
import bridge from "./bridge";
import router from "./router";
import { usePageStore } from "./store/index";
import { decryptParams, toPromise } from "@/utils";
const defaultState = { lifeState: PageState.pendding, preloadFn: null };
const namePool = {};
// 总事件管理
function IPage(name, option?) {
  if (isObject(name)) {
    option = name;
    name = option.name || "_unknow";
  }
  if (namePool[name] && name !== "_unknow") {
    assert(
      true,
      `存在重名路由${name}，请确认该路径名称是否重复 // PS：目前没找到更好的页面名称设置的逻辑，如果有更好的思路欢迎到https://github.com/pangolierse/wx-ez-tool提`,
    );
  } else {
    namePool[name] = true;
  }
  option.$name = name;
  option.$state = JSON.parse(JSON.stringify(defaultState));
  // 页面是否存活
  option.$isPageAlive = function () {
    return this.$state?.lifeState !== PageState.unload;
  };
  // 若项目声明了状态管理器则对每个页面进行检测
  if (stateProxy.store) {
    usePageStore(option, stateProxy.store);
  }
  if (option.onNavigate) {
    assert(name !== "_unknow", "用到onNavigate方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
    let onNavigateHandler = function (url, params) {
      option.onNavigate({ url, params });
    };
    console.log(`Page[${name}] define "onNavigate"`);
    dispatcher.on(`navigateTo:${name}`, onNavigateHandler);
    dispatcher.on(`redirectTo:${name}`, onNavigateHandler);
    dispatcher.on(`switchTabTo:${name}`, onNavigateHandler);
    dispatcher.on(`reLaunchTo:${name}`, onNavigateHandler);
  }
  if (option.onBack) {
    assert(name !== "_unknow", "用到onBack方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
    let onNavigateBackHandler = function (params) {
      option.onBack(params);
    };
    console.log(`Page[${name}] define "onBack"`);
    dispatcher.on(`navigateBack:${name}`, onNavigateBackHandler);
  }
  option.onLoad = wrapFun(option.onLoad, function (onLoadOption) {
    if (onLoadOption?.encodeData) {
      // 转化页面参数
      onLoadOption.params = decryptParams(onLoadOption.encodeData);
      delete onLoadOption.encodeData;
    }
    // 防止 热更新时页面报错
    if (!!this.$state == false) {
      this.$state = JSON.parse(JSON.stringify(defaultState));
    }
    this.$state.lifeState = PageState.loading;
    option.onAwake &&
      dispatcher.on("app:sleep", (t) => {
        option.onAwake.call(this, t);
      });
  });
  /**
   * preload lifecycle method
   */
  if (option.onPreload) {
    assert(name !== "_unknow", "用到onPreload方法必须要为页面添加name属性，name值需与APP中的路由规则相匹配");
    console.log(`Page[${name}] define "onPreload"`);
    dispatcher.on("preload:" + name, function (url, params) {
      option.onPreload = toPromise(option.onPreload);
      option.$state.preloadFn = option.onPreload({ url, params });
    });
    // preload将在onLoad时等待完成
    option.onLoad = wrapFun(option.onLoad, function () {
      this.$state = this.$state || {};
      if (this.$state.preloadFn) {
        this.$state.preloadFn
          .then((...args) => {
            option.onPreloaded(...args);
          })
          .catch((err) => {
            console.log("页面在预加载时出错：", err);
          });
      }
    });
  }
  bridge.methods(option);
  option.$m = bridge.mountRef;
  option.onReady = wrapFun(option.onReady, function () {
    this.$state.lifeState = PageState.ready;
    router.emit("page:ready");
  });
  option.onUnload = wrapFun(option.onUnload, function () {
    this.$state.lifeState = PageState.unload;
    router.emit("page:unload");
  });
  if ("onPageLaunch" in option) {
    option.onPageLaunch();
  }

  return Page(option);
}
export default IPage;
