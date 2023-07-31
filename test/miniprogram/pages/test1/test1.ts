// pages/test1/test1.ts
PTool.Page({
  name: "test1",
  /**
   * 页面的初始数据
   */
  mapGetters: {
    testName: "test/name",
  },
  data: {
    abc:"",
    testName2: "123",
  },
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
  onLoad(option) {
    console.log(option);
    // setTimeout(() => {
    //   this.$back({
    //     params: {
    //       refresh: true,
    //     },
    //   });
    // }, 4000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},
  onNavigate({params}) {
    console.log("params",params)
    console.log(this)
    this.$put('defaultJumpOperate',{
      tab:1
    })
  },

  test(){
    wx.nextTick(()=>{
      this.setData({
        abc:"123",
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('take',this.$take("defaultJumpOperate"))
  },

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
