declare global {
  namespace PToolSpace {
    // 页面接受参数
    interface PageNavigateOption {
      url: string;
      params: Record<string, any>;
    }
    /** 页面注册选项 */
    interface PageOption<G extends MapGetterData> {
      // 页面名称
      name?: string;
      // 如果有启用store状态管理的话，mapGetters可以映射store中的getters
      mapGetters?: G;
      /**
       * 小程序在切入后台后被唤醒
       * @param time 休眠时间(单位ms)
       **/
      onAwake(time: number): void;

      /**
       * 页面预加载时触发，此时对应的页面并未被加载
       *
       * 需要在调用页面中使用`this.preload(pageName或pageShortName)`
       */
      onPreload(options: PageNavigateOption): void;
      /**
       * 页面预加载完成时触发，此时对应的页面的onload（异步）
       *
       * 需要在调用页面中使用`this.preload(pageName或pageShortName)`
       */
      onPreloaded(...a: any[]): void;

      /**
       * 页面即将被导航时触发
       *
       * 需要在调用页面中使用`this.$navigate(pageName或pageShortName)`
       * 才能正确触发`onNavigate`
       *
       * 另外需要特别注意第一次进入一个分包界面
       * 或者是通过微信小程序二维码或微信内分享直接跳转到小程序子页面时同样不会触发
       */
      onNavigate(options: PageNavigateOption): void;

      // 次级页面触发this.$back时触发
      onBack(params: Record<string, any>): void;
    }
    interface ComponentOption<G extends MapGetterData> {
      // 如果有启用store状态管理的话，mapGetters可以映射store中的getters
      mapGetters?: G;
    }
    interface AppOption {
      /** 小程序路径解析配置 */
      config: {
        /** 小程序路径 */
        route: string | string[];
        /**
         * 解析简称
         *
         * @param name 页面简称
         * @returns 实际页面的地址
         */
        resolvePath?(name: string): string;
      };

      /**
       * 小程序在切入后台后被唤醒
       * @param time 休眠时间(单位ms)
       */
      onAwake?(time: number): void;
    }
    interface Emit {
      // 监听事件
      on(type: string | "*", handler: (...args: any[]) => void): void;
      // 清空事件有传handler时只清空对应监听器，没传时清空所有类型的监听器
      off(type: string, handler: (...args: any[]) => void): void;
      // 触发事件,额外会触发一个*全局事件，任何事件触发时都会触发*
      emit(type: string, ...args: any[]): void;
      // 清空所有事件
      clean(): void;
      // 给对象提供当前事件管理器的所有方法（语法糖）
      assign(target: object): void;
    }

    interface NavigateToOption extends Omit<WechatMiniprogram.NavigateToOption, "url"> {
      url?: string;
      // 页面参数
      params?: any;
    }
    /** 页面跳转API */
    interface Router {
      /**
       * 导航到指定页面
       * 本函数是`wx.navigateTo`的封装。跳转到指定页面，`pagename`可以带上`queryString`
       *
       * @param pagename 页面名称或页面的路径
       * @param config 传递给`wx.navigateTo`Api的参数(url会自动由`pagename`解析的结果填充)
       * 其中params属性可以传对象作为页面参数，目标页接收将通过option.params的方式接收
       *
       * 示例：
       * ```js
       * this.$route('calulator?result=98',{
       *  params: {
       *  // query
       * }
       *  success: () => {
       *    // do something
       *  }
       * });
       * ```
       */
      $route(pagename: string, config?: NavigateToOption): void;
      $navigate(pagename: string, config?: NavigateToOption): void;
      /**
       * 跳转到指定页面, **替换页面，不产生历史**
       * @param pagename 页面名称或页面的路径
       * @param config 传递给 `wx.redirectTo` api的参数(url会自动由`pagename`解析的结果填充)
       * 其中params属性可以传对象作为页面参数，目标页接收将通过option.params的方式接收
       */
      $redirect(pagename: string, config?: NavigateToOption): void;
      /**
       * 本函数是`wx.switchTab`的封装。跳转到指定页面。
       * @param pagename 页面名称或页面的路径
       * @param config 传递给 `wx.switchTab` api的参数(url会自动由`pagename`解析的结果填充)
       *
       */
      $switchTab(pagename: string, config?: WechatMiniprogram.SwitchTabOption): void;
      /**
       * 关闭所有页面，打开到应用内的某个页面
       * 本函数是`wx.reLaunch`的封装。跳转到指定页面。`pagename`可以带上`queryString`
       * @param pagename 页面名称或页面的路径
       * @param config 传递给 `wx.reLaunch` api的参数(url会自动由`pagename`解析的结果填充)
       */
      $reLaunch(pagename: string, config?: NavigateToOption): void;

      /**
       * 返回上一页，`wx.navigateBack` 的封装
       * 会触发对应页面的 `onBack` 生命周期
       */
      $back(config?: NavigateToOption): void;

      /**
       * 提前预加载指定页面 (会触发对应页面的 `onPreload` 生命周期)
       * @param pagename 页面名称或页面的路径，可以带上`queryString`
       * @param params 可以传对象作为页面参数，目标页接收将通过option.params的方式接收
       * 示例：
       * ```js
       * this.$preload('play?vid=xxx&cid=xxx');
       * this.$preload('/page/main?userName=xxx&action=xxx',{age:12});
       * ```
       */
      $preload(pagename: string, params: any): void;
    }
    interface ToolState {
      refs: Record<string, typeof Component>;
      hideTime: number;
      eventBus: Emit;
      channel: Record<string, any>;
      store: Store;
    }

    type navigate = (c: NavigateToOption) => void;
    type MapGetterData = Record<string, string>;
    /** 页面实例 */
    type PageInstance<G extends MapGetterData> = Router &
      G & {
        /** 当前页面名称 */
        $name: string;

        /** 一些由PTool生成的页面状态 */
        $state: {
          // 页面激活状态
          lifeState: PageState;
        };
        /** 指定了 `ref` 的子组件实例Map */
        $refs: any;
        $store: StoreUse;
        // 一次性存取
        $put: (key: string, value: any) => void;
        $take: (key: string) => any;
      };

    /** 组件实例 */
    type ComponentInstance<G extends MapGetterData> = Router &
      G & {
        /** 当前组件所属的页面组件实例 只在 `attached`, `ready`生命周期后生效 */
        $root: any;
        $store: StoreUse;

        /** 一些由PTool生成的组件状态 */
        $state: {
          // 页面激活状态
          lifeState: ComponentState;
        };
        /**
         * 当前组件所属的父组件实例引用 只在 `attached`, `ready`生命周期后生效
         * 在非连续调用组件的情况下`$root`相同
         */
        $parent: any;
        /**
         * 指定了 ref 的子组件实例Map，在父组件获取子组件引用
         *
         * 示例：
         *
         * ```html
         * <custom-component binding="$" ref="customComp"/>
         * ```
         *
         * ```js
         * Page.P({
         *   onLoad: function () {
         *     this.$refs.customComp // 根据ref属性获取子组件的实例引用
         *   }
         * });
         * ```
         */
        $ref: any;
      };
    interface AppInstance {
      $store: StoreUse;
    }

    class Store {
      _actions: Record<string, Function>;
      _modules: ModuleCollection;
      _modulesNamespaceMap: Record<string, string>;
      _wrappedGetters: Record<string, (store: Store) => getter>;
      stateProxy: any;
      constructor(options: any);
      get state(): any;
      set state(v: any);
      get getters(): Record<string, (store: Store) => getter>;
      set getters(v: Record<string, (store: Store) => getter>);
      dispatch(_type: any, _payload?: any): any;
      registerGetters(mapGetter: any, pageOrComponent: any, contextData: any): void;
    }
    type StoreUse = Omit<
      Store,
      "_actions" | "_modules" | "_modulesNamespaceMap" | "_wrappedGetters" | "registerGetters" | "stateProxy"
    >;
    class ModuleCollection {
      root: Module;
      constructor(rawRootModule: StoreRootModule);
      get(path: any): any;
      getNamespace(path: any): any;
      update(rawRootModule: any): void;
      /**
       * 注册模块
       * @param {Array} path 路径
       * @param {Object} rawModule 原始未加工的模块
       * @param {Boolean} runtime runtime 默认是 true
       */
      register(path: string[], rawModule: StoreRootModule, runtime?: boolean): void;
      unregister(path: any): void;
    }

    class Module {
      runtime: string;
      _children: {};
      _rawModule: StoreModule | StoreRootModule;
      state: Record<string, any>;
      constructor(rawModule: StoreModule | StoreRootModule, runtime: any);
      get namespaced(): boolean;
      addChild(key: any, module: any): void;
      removeChild(key: any): void;
      getChild(key: any): any;
      update(rawModule: any): void;
      forEachChild(fn: any): void;
      forEachGetter(fn: any): void;
      forEachAction(fn: any): void;
    }

    interface Router<T extends object = any> {
      beforeEach: (fn: NavigationGuard) => Function;
      afterEach: (fn: NavigationGuard) => Function;
      navigateTo: navigate;
      redirectTo: navigate;
      switchTab: navigate;
      reLaunch: navigate;
      navigateBack: navigate;
      redirectDelegate: (t: T) => void;
    }
    type urlNeed = { url: string };
    type urlUnNeed = { url?: string };
    interface Route extends Omit<WechatMiniprogram.NavigateToOption, "url"> {
      name: string;
      url?: string;
      replace?: boolean;
    }
    interface RouteNeedUrl extends WechatMiniprogram.NavigateToOption {
      url: string;
      name?: string;
      replace?: boolean;
    }
    type NavigationGuardNext = (to?: Route | RouteNeedUrl | false | void) => void;

    type NavigationGuard = (to: Route | RouteNeedUrl, from: Route | RouteNeedUrl, next: NavigationGuardNext) => any;

    type StoreStateModel<T> = T & { model: T };
    interface StoreRootModule<T = any> {
      // 状态
      state?: T;
      getters?: Record<string, getter<StoreStateModel<T>>>;
      actions?: Record<string, action<StoreStateModel<T>>>;
      modules?: Record<string, StoreModule>;
    }
    interface StoreModule<T = any> extends StoreRootModule<T> {
      namespaced: string;
    }
    type action<T> = (
      context: {
        state: T;
        dispatch: Function;
        rootState: any;
        rootGetters: any;
      },
      ...args: any[]
    ) => Promise<any> | void;
    type getter<T = any> = (
      state: T,
      getters: Record<string, getter<T>>,
      rootState: object,
      rootGetters: Record<string, getter<T>>,
    ) => any;

    enum PageState {
      pendding = 0,
      loading = 1,
      ready = 2,
      unload = 3,
    }
    enum ComponentState {
      pendding = 0,
      attached = 1,
      ready = 2,
      detached = 3,
    }

    type IAnyObject = WechatMiniprogram.IAnyObject;
    namespace Page {
      type DataOption = WechatMiniprogram.Page.DataOption;
      type CustomOption = WechatMiniprogram.Page.CustomOption;
      type Options<D extends DataOption, C extends CustomOption, G extends MapGetterData> = Partial<PToolSpace.PageOption<G>> &
        WechatMiniprogram.Page.Options<D, C>;
      type WXInstance<D extends DataOption, C extends CustomOption, G extends MapGetterData> = PToolSpace.PageInstance<G> &
        WechatMiniprogram.Page.Instance<D & G, C> & { [index: string]: any };

      type WXOption<D extends DataOption, C extends CustomOption, G extends MapGetterData> = ThisType<WXInstance<D, C, G>> &
        Options<D, C, G>;

      interface WXConstructor {
        <D extends DataOption, C extends CustomOption, G extends MapGetterData>(name: string, options: WXOption<D, C, G>): void;
      }
      interface WXConstructor {
        <D extends DataOption, C extends CustomOption, G extends MapGetterData>(
          options: WXOption<D, C, G> & { name?: string },
        ): void;
      }
    }

    namespace Component {
      type DataOption = WechatMiniprogram.Component.DataOption;
      type PropertyOption = WechatMiniprogram.Component.PropertyOption;
      type MethodOption = WechatMiniprogram.Component.MethodOption;
      type Instance<
        D extends DataOption,
        P extends PropertyOption,
        M extends Partial<MethodOption>,
        G extends MapGetterData,
      > = WechatMiniprogram.Component.Instance<D, P, M, G>;
      type Options<
        D extends DataOption,
        P extends PropertyOption,
        M extends Record<string, Function>,
        G extends MapGetterData,
      > = WechatMiniprogram.Component.Options<D, P, M, G>;
      type WXInstance<
        D extends DataOption,
        P extends PropertyOption,
        M extends MethodOption,
        G extends MapGetterData,
      > = PToolSpace.ComponentInstance<D> & Instance<D, P, M, G> & { [index: string]: any };

      type WXOption<D extends DataOption, P extends PropertyOption, M extends MethodOption, G extends MapGetterData> = Partial<
        PToolSpace.ComponentOption<G>
      > &
        ThisType<WXInstance<D, P, M, G>> &
        Options<D, P, M, G>;

      interface WXConstructor {
        <D extends DataOption = any, P extends PropertyOption = any, M extends MethodOption = any, G extends MapGetterData = any>(
          options: WXOption<D, P, M, G>,
        ): string;
      }
    }

    namespace App {
      type Option = WechatMiniprogram.App.Option;
      type WXInstance<T extends IAnyObject> = Option & T & PToolSpace.AppInstance;

      type WXOption<T extends IAnyObject> = Partial<PToolSpace.AppOption> & Partial<Option> & T & ThisType<WXInstance<T>>;

      interface WXConstructor {
        <T extends IAnyObject>(options: WXOption<T>): void;
      }
    }
  }
  let PTool: {
    App: PToolSpace.App.WXConstructor;
    Component: PToolSpace.Component.WXConstructor;
    Page: PToolSpace.Page.WXConstructor;
    router: PToolSpace.Router;
    store: PToolSpace.Store;
    createStore: (store: PToolSpace.StoreRootModule) => void;
  } & PToolSpace.Emit &
    PToolSpace.Router;
  type PToolStoreModule<T> = PToolSpace.StoreModule<T>;
}
declare let PToolExport: string;
export { PToolExport };
