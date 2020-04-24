<!--
 * @Author: huangwenming
 * @Date: 2020-04-24 14:02:23
 -->
# html-webpack-cache-plugin examples
> 提供了一个简易的使用webpack打包的SPA项目，使用 html-webpack-cache-plugin 插件对产出的assetTags进行修改，首次加载页面后，将js和css资源缓存到localstorage，二次打开页面则从缓存读取js和css内容，省去静态资源网络加载时间，从而起到加速效果；

## 使用demo
安装依赖，执行编译命令
```
npm install

npm run build

```
使用浏览器打开dist目录下demo.html，打开dev-tools，观察localstorage和network变化