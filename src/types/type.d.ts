/// <reference path="../../node_modules/miniprogram-api-typings/index.d.ts" />
import { Store } from "../lib/store/index";

interface Emit {
  // 监听事件
  on(type: string | "*", handler: (...args: any[]) => void): void;
  // 清空事件有传handler时只清空对应监听器，没传时清空所有类型的监听器
  off(type: string, handler: (...args: any[]) => void): void;
  // 触发事件,额外会触发一个*全局事件，任何事件触发时都会触发*
  emit(type: string, arg: any[]): void;
  // 清空所有事件
  clean(): void;
  // 给对象提供当前事件管理器的所有方法（语法糖）
  assign(target: object): void;
}

interface NavigateToOption extends WechatMiniprogram.NavigateToOption {
  // 页面参数
  params?: any;
}
interface ToolState {
  refs: Record<string, any>;
  hideTime: number;
  eventBus: Emit;
  channel: Map<string, any>;
  store: Store;
}
type navigate = (c: NavigateToOption) => void;
interface NavigateMethod<T extends object = any> {
  // @ts-ignore
  navigateTo: navigate;
  redirectTo: navigate;
  switchTab: navigate;
  reLaunch: navigate;
  navigateBack: () => void;
  redirectDelegate: (t: T) => void;
}
interface StoreRootModule {
  // 状态
  state: object;
  getters: Record<string, getter>;
  actions: Record<string, Promise<any>>;
  modules: Record<string, StoreModule>;
}
interface StoreModule extends StoreRootModule {
  namespaced: string;
}
type getter = (state: object, getters: Record<string, getter>, rootState: object, rootGetters: Record<string, getter>) => any;
