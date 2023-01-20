import IPage from "./lib/page";
import IApp from "./lib/app";
import redirector from "./lib/redirector";
import IComponent from "./lib/component";
import { stateProxy, dispatcher } from "./lib/state";
const PTool = {
  Page: IPage,
  Component: IComponent,
  App: IApp,
  store: stateProxy.store,
  createStore: dispatcher.createStore,
};
stateProxy.eventBus.assign(PTool);
redirector.redirectDelegate(PTool);
// 自动注入PTool到全局
Object.defineProperty(Object.prototype, "PTool", {
  value: PTool,
  configurable: false,
  enumerable: false,
});
export default PTool;
