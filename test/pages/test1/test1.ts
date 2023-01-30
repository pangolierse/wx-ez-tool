// pages/test1/test1.ts
PTool.Page("test1", {
  /**
   * 页面的初始数据
   */
  mapGetters: {
    name: "test/name",
  },
  data: {},
  onPreload(option) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(option);
      }, 10000);
    });
  },
  onPreloaded(res) {
    console.log("test1：预加载完成");
    console.log(res);
  },
  changeName() {
    this.$store.dispatch("test/changeName", 123123);
  },
  onLoad() {
    setTimeout(() => {
      this.$back({
        params: {
          refresh: true,
        },
      });
    }, 4000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},
  onNavigate() {
    console.log("test1: navigate");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
