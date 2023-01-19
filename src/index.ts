import IPage from "./lib/page";
import IApp from "./lib/app";
import redirector from "./lib/redirector";
import IComponent from "./lib/component";
import { stateProxy, dispatcher } from "./lib/state";
// 事件总线语法糖
// eventBus.assign(PTool);
// 分发跳转事件
// bridge.redirectDelegate(PTool.redirector, PTool._dispatcher);
const PTool = {
  Page: IPage,
  Component: IComponent,
  App: IApp,
  store: stateProxy.store,
  createStore: dispatcher.createStore,
};
redirector.redirectDelegate(PTool);

export default PTool;
