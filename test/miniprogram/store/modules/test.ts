interface TestState {
  name: string;
}
const test: PToolStoreModule<TestState> = {
  namespaced: "test",
  state: {
    name: "123",
  },
  getters: {
    name: function (state) {
      return state.name;
    },
  },
  actions: {
    changeName({ state }, name) {
      state.name = name;
    },
  },
};
export default test;
