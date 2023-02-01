// 获取应用实例
const app = getApp();
PTool.Page({
  name: "index",
  data: {
    motto: "Hello World",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse("open-data.type.userAvatarUrl") && wx.canIUse("open-data.type.userNickName"), // 如需尝试获取用户信息可改为false
  },
  mapGetters: {
    name: "test/name",
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },
  onBack(params: any) {
    console.log(params);
  },
  onLoad() {
    this.setData({
      canIUseGetUserProfile: true,
    });
    this.$preload("test1", { msg: "test1你该预加载了" });
  },
  gotoTest1() {
    console.log("route");
    console.log(new Date().getTime());
    this.$route("test1?age=1",{
      params:{name:1}
    });
  },
  getUserProfile(e: any) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: "展示用户信息", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      },
    });
  },
  getUserInfo(e: any) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    });
  },
});
