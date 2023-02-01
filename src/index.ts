import IPage from "./lib/page";
import IApp from "./lib/app";
import router from "./lib/router";
import IComponent from "./lib/component";
import { stateProxy, dispatcher } from "./lib/state";
import bridge from "./lib/bridge";
const PTool = {
  Page: IPage,
  Component: IComponent,
  App: IApp,
  router: router,
  createStore: dispatcher.createStore,
};
Object.defineProperty(PTool, "store", {
  get() {
    return stateProxy.store;
  },
  configurable: false,
});
stateProxy.eventBus.assign(PTool);
bridge.redirectDelegate(router, dispatcher);
router.redirectDelegate(PTool);
// 自动注入PTool到全局
Object.defineProperty(Object.prototype, "PTool", {
  value: PTool,
  configurable: false,
  enumerable: false,
});
export default PTool;
