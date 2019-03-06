/**
 * @file HtmlWebpackPlugin Hook插件
 * @description 用于缓存js和css资源
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');

class HtmlWebpackCachePlugin {
    constructor(options) {
        this.options = options || {};
    }
    apply (compiler) {
        let self = this;
        // console.log(self.options)
        compiler.hooks.compilation.tap('HtmlWebpackCachePlugin', (compilation) => {
            // console.log('The compiler is starting a new compilation...')

            // Staic Plugin interface |compilation |HOOK NAME | register listener
            compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
                // HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
                'HtmlWebpackCachePlugin', // <-- Set a meaningful name here for stacktraces
                (data, cb) => {
                    // Manipulate the content
                    // 包装一个ajax请求，因为webpack打包产出的文件一般不涉及跨域问题
                    function getHttpRequest() {
                        if (window.XMLHttpRequest) return new XMLHttpRequest();
                        else if (window.ActiveXObject) return new ActiveXObject("MsXml2.XmlHttp");
                    }
                    function ajaxPage(sId, url, type) {
                        var oXmlHttp = getHttpRequest();
                        oXmlHttp.onreadystatechange = function () {
                            if ( oXmlHttp.readyState == 4 ){
                                if ( oXmlHttp.status == 200 || oXmlHttp.status == 304 ) {
                                    type == 'js' && (includeJs(sId, url, oXmlHttp.responseText));
                                    // type如果是css，需要立即修改css
                                    type == 'css' && (includeCss(sId, url, oXmlHttp.responseText));
                                }
                            }
                        };
                        oXmlHttp.open("GET", url, false);
                        oXmlHttp.send(null);
                    }
                    // 请求对应测js文件
                    function includeJs(sId, fileUrl, source) {
                        // alert(fileUrl)
                        if (( source != null ) && ( !document.getElementById(sId) )) {
                            var oHead = document.getElementsByTagName("HEAD").item(0);
                            var oScript = document.createElement("script"); oScript.type = "text/javascript";
                            oScript.id = sId;
                            oScript.defer = true;
                            oScript.text = source;
                            try {
                                // 为了防止localstorage存储溢出，需要过期的缓存进行处理，默认采用chunk的hash值做新旧区分
                                var regResult = /(.*)\.[0-9a-z]*\.js/.exec(sId);
                                for (var i = 0, len = localStorage.length; i < len; i++){
                                    var key = localStorage.key(i);
                                    var oldResult = /(.*)\.[0-9a-z]*\.js/.exec(key)
                                    if (regResult && oldResult && regResult[1] && oldResult[1] && regResult[1] == oldResult[1]) {
                                        // console.log(regResult);
                                        // console.log(oldResult);
                                        localStorage.removeItem(key);
                                    }
                                }
                                localStorage.setItem(sId, source);
                            } catch (e) {
                                console.log(e);
                            }
                            oHead.appendChild(oScript);
                        }
                    }
                    // 请求对应css文件
                    function includeCss(sId, fileUrl, source) {
                        if (( source != null ) && ( !document.getElementById(sId) )) {
                            // 为准备内嵌的style元素，内嵌样式，同时将css文件内容计入缓存
                            var backupCss = document.querySelector("style[ls_id='" + sId + "']");
                            backupCss.innerHTML = source;
                            try {
                                // 为了防止localstorage存储溢出，需要过期的缓存进行处理，默认采用chunk的hash值做新旧区分
                                var regResult = /(.*)\.[0-9a-z]*\.css/.exec(sId);
                                for (var i = 0, len = localStorage.length; i < len; i++){
                                    var key = localStorage.key(i);
                                    var oldResult = /(.*)\.[0-9a-z]*\.css/.exec(key)
                                    if (regResult && oldResult && regResult[1] && oldResult[1] && regResult[1] == oldResult[1]) {
                                        // console.log(regResult);
                                        // console.log(oldResult);
                                        localStorage.removeItem(key);
                                    }
                                }
                                localStorage.setItem(sId, source);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                    // 拼出缓存机制下的scirpt标签内的缓存处理代码
                    var syncLoadScript = getHttpRequest.toString() + ajaxPage.toString() + includeJs.toString();
                    var syncLoadCss = getHttpRequest.toString() + ajaxPage.toString() + includeCss.toString();
                    // 依据options中的jsOmit和cssOmit选项，进行过滤
                    let options = self.options;
                    let {jsOmit, cssOmit} = options;
                    let [cacheScripts, styles, cacheStyles] = [[], [], []];
                    // 生成支持js缓存的script标签
                    data.body.map(function (script) {
                        let scriptPath = script.attributes.src;
                        if (!(jsOmit && jsOmit.test(scriptPath))) {
                            var htmlContent = '';
                            var lsId = '"' + scriptPath + '"';
                            var quotLsId = lsId.replace(/\"/g, '\'');
                            htmlContent += syncLoadScript;
                            htmlContent += 'if (localStorage) {\n'
                                + 'var scriptFromCache = localStorage.getItem(' + lsId + ');\n'
                                + 'var scriptDom = document.querySelector("[ls_id=' + quotLsId + ']");\n'
                                + 'if (scriptFromCache) {\nscriptDom.text = (new Function(scriptFromCache))();\n}\nelse {\n'
                                + 'ajaxPage(' + lsId + ', ' + lsId + ', "js")\n}}\n else {\n'
                                + 'scriptDom.defer = true;\nscriptDom.setAttribute("src",' + lsId + ');\n}'
                            script.innerHTML = htmlContent;
                            script.attributes = {
                                type: 'text/javascript',
                                ls_id: scriptPath
                            };
                        }
                        cacheScripts.push(script);
                    });

                    data.head.map(function (style) {
                        // 创建style标签，用于无缓存情况下，请求css文件之后，嵌入样式
                        let stylePath = style.attributes.href;
                        if (/\.css$/.test(stylePath) && !(cssOmit && cssOmit.test(stylePath))) {
                            styles.push({
                                tagName: 'style',
                                closeTag: true,
                                attributes: {
                                    type: 'text/css',
                                    ls_id: stylePath
                                }
                            });
                        }
                    });
                    // console.log(styles)
                    // 支持css缓存，则需要把link标签修改为script标签，然后为scirpt标签注入缓存代码
                    data.head.map(function (style) {
                        let stylePath = style.attributes.href;
                        if (/\.css$/.test(stylePath) && !(cssOmit && cssOmit.test(stylePath))) {
                            var htmlContent = '';
                            var lsId = '"' + stylePath + '"';
                            var quotLsId = lsId.replace(/\"/g, '\'');
                            htmlContent += syncLoadCss;
                            htmlContent += 'if (localStorage) {'
                                + 'var cssFromCache = localStorage.getItem(' + lsId + ');'
                                + 'var cssDom = document.querySelector("style[ls_id=' + quotLsId + ']");'
                                + 'if (cssFromCache) {cssDom.innerHTML = cssFromCache;}else {'
                                + 'ajaxPage(' + lsId + ', ' + lsId + ', "css")}} else {'
                                + 'cssDom.setAttribute("href",' + lsId + ');}';
                            cacheStyles.push({
                                tagName: 'script',
                                closeTag: true,
                                attributes: {
                                    type: 'text/javascript',
                                },
                                innerHTML: htmlContent
                            });
                        }
                    });
                    styles = styles.concat(cacheStyles);
                    data.body = cacheScripts;
                    data.head = styles;
                    // console.log(styles);
                    // Tell webpack to move on
                    cb(null, data)
                }
            )
        })
    }
}

module.exports = HtmlWebpackCachePlugin;
