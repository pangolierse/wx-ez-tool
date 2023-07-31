import store from "./store/index";
// PTool.App({
import "wx-ez-tool"

PTool.createStore(store);
PTool.router.beforeEach((to, from, next) => {
  next();
});
PTool.router.beforeEach((to, from, next) => {
  next();
});
// PTool.router.beforeEach((to, from, next) => {
//   if (to.name == "logs") {
//     next({ name: "test1" });
//     return;
//   }
//   next();
// });
PTool.App({
  config: {
    route: "/pages/$page/$page",
    beforePageInitExtend:({option,fns}) => {
      // option.onLoad = fns.wrapFun(option.onLoad,function(){
      //   console.log("每个页面都要console：",this.route)
      // })
    }
  },
  onLaunch() {
    PTool.store.dispatch("test/changeName","123123123")
    // this.$store.dispatch("test/changeName","123123123")
    // 展示本地存储能力
    const logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);

    // 登录
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    });
  },
  globalData: {
    userInfo: null,
  },
});
