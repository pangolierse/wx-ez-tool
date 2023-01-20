import config from "./config";
import { dispatcher } from "./state";
import redirector from "./redirector";
const navigate = route({ type: "navigateTo" });
const redirect = route({ type: "redirectTo" });
const switchTab = route({ type: "switchTab" });
const reLaunch = route({ type: "reLaunch" });
export default {
  redirectDelegate: function (emitter, dispatcher) {
    ["navigateTo", "redirectTo", "switchTab", "reLaunch"].forEach(function (k) {
      emitter.on(k, function (url, params) {
        var name = getPageName(url);
        name && dispatcher.emit(k + ":" + name, url, params);
      });
    });
  },
  mountRef: function (e) {
    let componentID = e.detail;
    let ref = dispatcher.getRef(componentID);
    if (!ref) return;
    let refName = ref._$ref;
    if (refName && this.$refs) {
      this.$refs[refName] = ref;
    }
    ref._$attached(this);
  },
  methods: function (ctx) {
    // 组件快速调用
    ctx.$refs = {};
    // 一次性存取
    ctx.$put = dispatcher.put;
    ctx.$take = dispatcher.take;
    /**
     * 路由方法
     */
    ctx.$route = ctx.$navigate = navigate;
    ctx.$redirect = redirect;
    ctx.$switch = switchTab;
    ctx.$reLaunch = reLaunch;
    ctx.$back = back;
    /**
     * 页面预加载
     */
    ctx.$preload = preload;
    /**
     * 页面信息
     */
    ctx.$curPage = getPage;
    ctx.$curPageName = curPageName;
  },
  getPageName,
};

function route({ type }) {
  return function (url, option) {
    var parts = url.split(/\?/);
    var pagepath = parts[0];
    if (/^[\w\-]+$/.test(pagepath)) {
      pagepath = (config.get("customRouteResolve") || config.get("routeResolve"))(pagepath) as string;
    }
    if (!pagepath) {
      // @ts-ignore
      throw new Error("Invalid path:", pagepath);
    }
    option = option || {};
    // append querystring
    option.url = `${pagepath}${option.params ? "?encodeData=" + encodeURI(JSON.stringify(option.params)) : ""}`;
    redirector[type](option);
  };
}

function back(delta, config) {
  wx.navigateBack({
    delta: delta || 1,
    ...config,
  });
}
function preload(url, params) {
  var name = getPageName(url);
  name && dispatcher && dispatcher.emit("preload:" + name, url, params);
}
function getPage() {
  return getCurrentPages().slice(0).pop();
}
function getPageName(url) {
  var m = /^[\w\-]+(?=\?|$)/.exec(url);
  return m ? m[0] : config.get("nameResolve")(url);
}
function curPageName() {
  var route = getPage()!.route;
  if (!route) return "";
  return getPageName(route);
}
