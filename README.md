# html-webpack-cache-plugin
![npm version](https://img.shields.io/npm/v/html-webpack-cache-plugin)  

> Based on the functions of [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) that simplifies creation of HTML files to serve your webpack bundles, we can cache the webpack bundles using localstorage to optimize the page loading speed.

## 插件功能

1. 将原来webpack产出的bundle进行缓存处理，包含js和css，以达到二次打开页面秒开的效果。

只使用html-webpack-plugin产出的代码是：
```
<head>
<link href="a.xxxx.css" rel="stylesheet">
</head>

<body>
<script type="text/javascript" src="a.xxzz.js"></script>
</body>

```

配合使用html-webpack-cache-plugin产出后的代码是：

头部的css处理：
```
<head>
<style rel="stylesheet" ls_id="a.xxxx.css"></style>
<script>
// 先去判断localstorage中是否缓存了a.xxxx.css，缓存则从缓存中取值
var cacheCss = localstorage.getItem("a.xxxx.css");
if (cacheCss) {
	document.querySelector('style[lsid="a.xxxx.css"]').innerHTML = cacheCss;
}
// 未缓存，则读取css文件后，缓存到localstorage
else {
	ajaxGet("a.xxxx.css").then(function(cssContent) {
		document.querySelector('style[lsid="a.xxxx.css"]').innerHTML = cssContent;
		localstorage.setItem("a.xxxx.css", cssContent)
	});
}
</script>
</head>

```

body部分的js处理：
```
<body>
<script type="text/javascript" ls_id="a.xxzz.js"></script>
<script>
// 先去判断localstorage中是否缓存了a.xxzz.js，缓存则从缓存中取值
var cacheJs = localstorage.getItem("a.xxzz.js");
if (cacheJs) {
	document.querySelector('script[lsid="a.xxzz.js"]').innerHTML = cacheJs;
}
// 未缓存，则读取js文件后，缓存到localstorage
else {
	ajaxGet("a.xxzz.js").then(function(jsContent) {
		document.querySelector('script[lsid="a.xxzz.js"]').innerHTML = jsContent;
		localstorage.setItem("a.xxzz.js", jsContent)
	});
}
</script>
</body>

```

2. 支持产出bundle更新后，缓存也同步更新，无需担心localstorage的存储空间。
一般webpack产出的bundle的名字上都会带上hash来区分版本，如a.xxzz.js文件，使用xxzz来表示版本号；由上例中
可知，我们是采用产出的bundle的路径名作为了该文件在localstorage中的key，版本更新的时候，我们会把新的key值
存入到localstorage，但是统一域名下localstorage的限制是5M，所以必须在localstorage中同一文件的旧key值
删除。

```
// 当存入新的key值之前，需要遍历localstorage找到同一文件的旧key值，然后删除

localstorage.removeItem("a.xxzz.js")

localstorage.setItem("a.xxzy.js", jsContent)

```

## 如何使用

**<font style="color: red">前提条件：</font>**  
<font style="color: red">1.支持 webpack4 + html-webpack-plugin(>=3.0.0);</font>  
<font style="color: red">2.要求bundle产出不跨域; bundle的名字为`filename + hash + 后缀结构`</font>  

```
 npm i html-webpack-cache-plugin --save-dev

```

```
// webpack.conf.js
// 注意：该插件需要在plugins中的位置在html-webpack-plugin之后使用
const HtmlWebpackCachePlugin = require('html-webpack-cache-plugin');
webpackConfig.plugins.push(
        new HtmlWebpackCachePlugin({
            jsOmit: '',  // 过滤掉的js，即不进行缓存处理，值为空或正则表达式
            cssOmit: ''  // 过滤掉的css，即不进行缓存处理，值为空或正则表达式
        })
    );
```

## 效果截图

下面的截图来自实际项目：

![](https://github.com/huangwenming/html-webpack-cache-plugin/raw/master/images/demo-effect.png)

