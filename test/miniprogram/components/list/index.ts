// components/list/index.ts
PTool.Component({
  properties: {},
  mapGetters: {
    testName: "test/name",
  },
  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    gotoLog() {
      this.$route("logs");
    },
  },
});
