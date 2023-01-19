import { ToolState } from "@/types/type";
import { assert } from "../utils/is";
import Emit from "./emit";
import { Store } from "./store/index";
const emit = new Emit();
const _dispatcher = new Emit();
const state: ToolState = {
  // 组件ID:__wxExparserNodeId__
  refs: {},
  // APP 隐藏时间
  hideTime: 0,
  // 一次性缓存（即存即用）
  channel: new Map(),
  store: null,
  eventBus: emit,
};

export const stateProxy = new Proxy(state, {
  get(target: any, p: PropertyKey, receiver: any) {
    return Reflect.get(target, p, receiver);
  },
  set() {
    assert(false, "禁止直接修改工具全局状态，如需修改请使用抛出的方法修改");
    return true;
  },
});
export const dispatcher = _dispatcher.assign({
  getRef(id: string) {
    return state.refs[id];
  },
  deleteRef(id: string) {
    delete state.refs[id];
  },
  setRef(id: string, ref) {
    state.refs[id] = ref;
  },
  updateHideTime(time: number) {
    state.hideTime = time;
  },
  put(key: string, value: any) {
    state.channel[key] = value;
  },
  take(key) {
    var v = state.channel[key];
    // 释放引用
    state.channel[key] = null;
    return v;
  },
  createStore(store) {
    this.store = new Store(store);
  },
});
