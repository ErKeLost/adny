## @ycb/vue-view-loading

> 页面状态管理组件

## 安装

```
npm install @ycb/vue-view-loading --registry http://npm.ycb51.cn
```

## 使用

- 全局注册

```
import Vue from 'vue'
import VueViewLoading from '@ycb/vue-view-loading'

Vue.use(VueViewLoading)
```

- 组件使用

```
<ycb-view-loading :load="getDetail">
  // 页面内容
</ycb-view-loading>
```

- 局部注册

```
import ViewLoading from '@ycb/vue-view-loading'

export default {
  components: {
    ViewLoading
  },
  // ...
}
```

- 组件使用

> 注：局部注册时组件名可以自定义，全局注册时组件名为默认 YcbViewLoading

```
<view-loading :load="getDetail">
  // 页面内容
</view-loading>
```

## API

### props

- load(Function)

  必需，且该函数需返回 Promise 类型，组件初始为 loading 状态，mounted 钩子内调用 load 函数，根据返回的 Promise 议决状态改变状态为 fail 或 success

### methods

- reload

  用于重新获取页面数据，可用在自定义  fail 插槽内

```
this.$refs.ViewLoading.reload()
```

### slot

- default (必需)

  默认插槽，页面内容，success 状态渲染

- loading 

  加载效果，loading 状态渲染

- fail

  异常效果，fail 状态渲染

## 调试

### 打包

```
npm run build
```

### 发布

> 必需升级版本号

```
npm publish --registry http://npm.ycb51.cn
```
