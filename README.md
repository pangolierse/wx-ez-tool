
# wx-ez-tool
wx-ez-tool 是一个轻量级微信小程序开发工具（原生），解决了一些开发痛点，当然跟大型框架没法比。好处就是简单易上手，好改造，可以很快的让一些旧的老项目支持

## 致来者
该工具初衷只是为了方便使用原生语言开发时能提供一些便捷的操作，里面有很多写的不成熟的地方还望提出，我会及时修改、以及如果有希望添加的新功能也可以提，我有看到也会酌情添加。

## 事项

- [ ] 调整mapGetters的ts声明
- [ ] 优化store，this.setData的调用
## 目录
 > [快速开始](#快速开始)

 > [程序](#程序)

 >> [定义](#程序-定义)

 >> [实例属性](#程序-实例属性)

 >> [实例方法](#程序-实例方法)

 > [页面](#页面)

 >> [定义](#页面-定义)

 >> [实例属性](#页面-实例属性)

 >> [实例方法](#页面-实例方法)

 > [组件](#组件)

 >> [定义](#组件-定义)

 >> [实例属性](#组件-实例属性)

 >> [实例方法](#组件-实例方法)

 > [状态管理](#状态管理)

 >> [定义](#状态管理-定义)

 >> [实例方法](#状态管理-方法)

 > [路由](#路由)

 >> [守卫](#路由-守卫)

### 快速开始
```
npm install wx-ez-tool 
...
成功后，构建npm
 <!-- app.ts(js) -->
import "wx-ez-tool";
即可使用
<!-- app.ts(js) -->
PTool.App({
  config: {
    route: "/pages/$page/$page",
  },
});
<!-- pages/index/index.ts(js) -->
PTool.Page({
    name:"index",
    onLoad(){
        setTimeout(()=>{ 
            this.$route("test", {
                params: { name: "123" }
            }); 
        }, 1000)
    }
})
<!-- pages/test/test.ts(js) -->
PTool.Page({
    name:"test",
    onLoad(option){
        console.log(option.params)
        // { name: "123" }
    }
})
```
在上述示例中，展示了工具的路由跳转功能传参功能，如您还不了解工具内容，强烈建议阅读使用说明
### 程序
#### 程序-定义
```
PTool.App({
  config: {
    route: '/pages/$page/$page'   // $page 会被替换成页面名
  },
  onLaunch: function () {

  },
  onShow: function () {

  }
});
```
#### 程序-生命周期
* onAwake(time:`number`)
小程序进入后台模式后再激活的时候触发。time是耗时。
#### 程序-配置
* route`必需`
> route 支持数组，为多项路由的时候，必须搭配 resolvePath 使用，否则默认采用第一项作为路径还原。
* resolvePath: ()=>string `可选`
当route为数组时，需在此处理适用规则
* beforePageInitExtend: ({option:`页面option`,fns:`函数工具库`,state:`工具的一些状态`,dispatcher:`工具的分发器`})
在工具库初始化Page前添加一些自己的拓展
> 需要对工具库有一定的熟悉，其实很简单啦自己看看源码轻轻松松修改
* afterPageInitExtend: ({option:`页面option`,fns:`函数工具库`,state:`工具的一些状态`,dispatcher:`工具的分发器`})
同上，不过是工具的Page初始化后

### 页面
#### 页面-定义
```
PTool.Page({
    name:"",
    mapGetters:{
    },
    onNavigate(){},
    onBack(){},
    onPreload(){},
    onPreloaded(){},
    onAweak(){},
    onPageLaunch(){}
})
```
* name: 页面名 `可选` ！（当使用相关周期以及路由缩写时为必填）
* mapGetters: 需要注入的getter `可选`
#### 页面-声明周期
* onNavigate({url: `string`, params:`object`})
调用（switchTab，navigateTo，redirectTo，reLaunchTo）, 注意若使用了分包且未开启预加载时，该生命周期将无法正常使用
* onBack(params:`object`)
当次级页面（下一个页面）调用this.$back时会触发此周期函数
* onPreload({url: `string`, params:`object`})
预加载函数，用于提前加载页面业务数据，加快目标页面加载时间
* onPreloaded(args: onPreload返回的数据)
预加载完成函数，在onLoad中调用
* onAweak(time:`number`)
小程序退到后台去再显示期间的耗时
* onPageLaunch()
页面被加载时调用（注意加载并非创建，创建时指用户访问到该页面页面被创建）
#### 页面-实例属性
* $name: 页面名称(未填写为_unknow)
* $state: 
    {
        lifeState：页面生命状态（0,1,2,3）
        0:等待中，1：加载中 （loading），ready（ready），unload：未挂载
        preloadFn：预加载函数
    }
* $refs: 组件快速调用
* $store: 状态管理机
#### 页面-实例方法
* $isPageAlive():boolean
判断当前页面是否活着
* $put(key:string, value: any)
一次性缓存数据（被取出即销毁）
* $take(key:string):any
取出一次性缓存数据
* $curPage()
获取当前页
* $curPageName()
获取当前页名称
* $m()
用于挂载组件的函数，需要配合ref使用
```
    <!-- wxml -->
    <example ref="example" bind:mount="$m"/>
    <!-- 页面 js -->
    this.$refs.example // example组件实例
```
___
`注意，如未使用下列路由跳转方式，一些工具功能（拓展周期）将无法使用`
* $route(url:string, config:NavigateToOption)
相当于navigateTo
* $redirect(url:string, config:NavigateToOption)
相当于redirectTo
* $switch(url:string, config:NavigateToOption)
相当于switchTab
* $reLaunch(url:string, config:NavigateToOption)
相当于reLaunch
* $back(config: BackToOption)
相当于navigateBack
* $preload(url:string, params:参数)
调用预加载，url可为目标页路径或者为目标页名称

### 组件
#### 组件-定义
```
PTool.Component({
  data: {},
  attached: function () {
    /**
     * this.$root
     * this.$parent
     */
  }
});
```
#### 组件-实例属性
* $root 根实例(页面)
* $parent 父实例
* $refs 组件快速调用
* $store: 状态管理机
#### 组件-实例方法
* $isComponentAlive():boolean
判断当前组件是否活着
* $put(key:string, value: any)
一次性缓存数据（被取出即销毁）
* $take(key:string):any
取出一次性缓存数据
* $curPage()
获取当前页
* $curPageName()
获取当前页名称
* $m()
用于挂载组件的函数，需要配合ref使用
```
    <!-- wxml -->
    <example ref="example" bind:mount="$m"/>
    <!-- 页面 js -->
    this.$refs.example // example组件实例
```
___
`注意，如未使用下列路由跳转方式，一些工具功能（拓展周期）将无法使用`
* $route(url:string, config:NavigateToOption)
相当于navigateTo
* $redirect(url:string, config:NavigateToOption)
相当于redirectTo
* $switch(url:string, config:NavigateToOption)
相当于switchTab
* $reLaunch(url:string, config:NavigateToOption)
相当于reLaunch
* $back(config: BackToOption)
相当于navigateBack
* $preload(url:string, params:参数)
调用预加载，url可为目标页路径或者为目标页名称

### 状态管理
#### 状态管理-定义
```
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
const store = {
    modules:{
        test,
    }
}
PTool.createStore(store);
```
> 上述步骤创建了一个含有test模块的store
>> 接下来既可以在组件或者页面中引入getters使用
```
<!-- 页面 -->
PTool.Page({
    mapGetters:{
        testName: "test/name",
    },
    onLoad(){
        console.log( this.testName ) // '123'
        console.log( this.data.testName ) // '123'
        this.$store.dispatch('test/changeName',2134)
        console.log( this.testName ) // 2134
    }
})
```
#### 状态管理-方法
* dispatch(type: `string`, args: any)
触发store中的actions方法，此方法会返回一个promise

### 路由
#### 路由-守卫
* beforeEach(fn:(to,from,next)=>{})
路由跳转前执行，调用next进行下一步，否则将不会跳转
* afterEach(fn:(to,from)=>{})
路由跳转后执行

### 致谢（灵感来源）
本工具整体架构基于此工具编写，奈何原作者已经不更新，且不具有响应式状态管理器，所以基于此框架进行一定拓展
- [@tvfe](https://github.com/tvfe/wxpage)
### github
- [@Pangolierse](https://github.com/pangolierse)

