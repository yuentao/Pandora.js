const templatePolyfill = require("template-polyfill");
require("core-js/es6/promise");
require("core-js/es6/symbol");

//兼容处理&&基础方法
(() => {
  //requestAnimationFrame
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = callback => {
      let currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = window.setTimeout(() => {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = id => {
      clearTimeout(id);
    };
  }

  //获取CSS变量
  const getRoot = name => {
    return getComputedStyle(document.documentElement).getPropertyValue(
      `--${name}`
    );
  };

  let rootText = "";
  if (!getRoot("alertTheme"))
    rootText += "/*alert背景*/--alertTheme:rgba(0, 0, 0,.45);";
  if (!getRoot("alertBg"))
    rootText += "/*alert遮罩*/--alertBg:rgba(0, 0, 0,.45);";
  if (!getRoot("alertFontSize"))
    rootText += "/*alert字体大小*/--alertFontSize:1rem;";
  if (!getRoot("alertColor")) rootText += "/*alert字体颜色*/--alertColor:#fff;";

  if (!getRoot("confirmTheme"))
    rootText += "/*confirm背景*/--confirmTheme:rgb(255, 255, 255);";
  if (!getRoot("confirmBg"))
    rootText += "/*confirm遮罩*/--confirmBg:rgba(0, 0, 0,.45);";
  if (!getRoot("confirmBtnBg"))
    rootText += "/*confirm按钮背景*/--confirmBtnBg:rgb(0,0,0);";
  if (!getRoot("confirmFontSize"))
    rootText += "/*confirm字体大小*/--confirmFontSize:1rem;";
  if (!getRoot("confirmColor"))
    rootText += "/*confirm字体颜色*/--confirmColor:#000;";
  if (!getRoot("confirmBtnColor"))
    rootText += "/*confirm按钮字体颜色*/--confirmBtnColor:#fff;";

  //CSS支持度判断
  const style = document.createElement("style"),
    styleText = `/*判断是否支持hover*/@media (any-hover: none){body::before{content: 'unsupport';display:none;}}/*判断是否支持CSS变量*/:root{--CSS:'support';${rootText}}`;
  style.id = "PDStyleChecker";
  style.innerHTML = styleText;
  document.querySelector("head").appendChild(style);

  //美化原生alert
  window.alert = content => {
    let mask = document.createElement("div"),
      maskBg = getRoot("alertBg") || "rgba(0, 0, 0,.45);",
      div = document.createElement("div"),
      timeout,
      Theme = getRoot("alertTheme") || "rgba(0, 0, 0,.45);",
      fontSize = getRoot("alertFontSize") || "1rem;",
      color = getRoot("alertColor") || "#fff;";

    mask.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99999;
      width: 100%;
      height: 100%;
      display:flex;
      justify-content:center;
      align-items: flex-end;
      background: ${maskBg};`;

    div.style.cssText = `
      background:${Theme};
      text-align: center;
      color: ${color};
      font-size: ${fontSize};
      padding: 1em 2em;
      line-height: 1.5;
      transition: opacity .4s ease-out;
      margin-bottom:5vh;`;

    div.innerHTML = content;
    mask.appendChild(div);
    document.body.appendChild(mask);

    mask.onclick = () => {
      clearTimeout(timeout);
      document.body.removeChild(mask);
      mask = null;
      div = null;
      timeout = null;
      color = null;
    };

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      div.style.opacity = 0;
      div.addEventListener("transitionend", () => {
        document.body.removeChild(mask);
        mask = null;
        div = null;
        timeout = null;
        color = null;
      });
    }, 800);
    return !1;
  };
  window.confirm = config => {
    const { content, confirmText, cancelText, success, fail } = config;
    let mask = document.createElement("div"),
      maskBg = getRoot("confirmBg") || "rgba(0, 0, 0,.45);",
      btnBg = getRoot("confirmBtnBg") || "rgb(0,0,0);",
      div = document.createElement("div"),
      msg = document.createElement("p"),
      Theme = getRoot("confirmTheme") || "rgb(255, 255, 255);",
      fontSize = getRoot("confirmFontSize") || "1rem;",
      color = getRoot("confirmColor") || "#000;",
      btnColor = getRoot("confirmBtnColor") || "#fff;",
      confirm = document.createElement("button"),
      cancel = document.createElement("button");

    mask.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
    width: 100%;
    height: 100%;
    display:flex;
    justify-content:center;
    align-items: center;
    background: ${maskBg};`;

    div.style.cssText = `
    background:${Theme};
    text-align: center;
    color: ${color};
    font-size: ${fontSize};
    padding: 1.5em;
    box-shadow: 0 0 10px rgba(0,0,0,.2);`;

    msg.style.cssText = `margin:0`;
    let buttonCSS = `margin: 4em 1em 0 1em;font-size: .8em;appearance: none;background: ${btnBg};color: ${btnColor};border: none;padding: 1em 3em;cursor: pointer;outline: none;`;
    confirm.style.cssText = buttonCSS;
    cancel.style.cssText = buttonCSS;

    msg.innerHTML = content;
    div.appendChild(msg);
    confirm.innerText = confirmText || "确认";
    cancel.innerText = cancelText || "取消";

    const removeConfirm = () => {
      document.body.removeChild(mask);
    };
    confirm.onclick = () => {
      removeConfirm();
      success && success();
    };
    cancel.onclick = () => {
      removeConfirm();
      fail && fail();
    };

    div.appendChild(confirm);
    div.appendChild(cancel);
    mask.appendChild(div);
    document.body.appendChild(mask);
  };
  //显示loading遮罩
  window.showLoading = () => {
    let mask = document.createElement("div");
    let svg = new Image();
    svg.src = "https://b.pandorajs.com/Pandora/src/loader.svg";
    mask.id = "Pd-upload-Mask";
    mask.appendChild(svg);
    document.body.appendChild(mask);
    document.querySelector("#Pd-upload-Mask").style.cssText =
      "width:100%;height:100%;position: fixed;z-index: 99;top: 0;left: 0;background:rgba(0,0,0,.65);display:flex;align-items: center; justify-content: center;";
  };
  window.hideLoading = () => {
    document.body.removeChild(document.querySelector("#Pd-upload-Mask"));
  };
})();
//内置方法
const PandoraAPI = class {
  constructor(element = "html") {
    this.element = element;
    this.getEle = ele => {
      const typeArr = ["[object Window]", "[object HTMLDocument]"];
      if (typeArr.includes(ele + "")) return window;
      if (document.querySelectorAll(ele).length > 1) {
        return document.querySelectorAll(ele);
      } else {
        return document.querySelector(ele);
      }
    };
    this.init = () => {
      const ele = this.getEle(element);
      try {
        ele.eventList = [];
        return ele;
      } catch (err) {
        console.error(`DOM中不存在名称为 ${this.element} 的元素`);
      }
    };
    this.get = this.init();
    //生产PandoraId
    this.pid = `PandoraAPI_${new Date().getTime()}`;
    //默认参数赋值
    this.extend = (config, options) => {
      if (!options) {
        options = config;
      } else {
        Object.keys(config).forEach(e => {
          if (typeof options[e] === "undefined") options[e] = config[e];
        });
      }
      return options;
    };
    //选择指定下标元素
    this.eq = index => {
      this.get = this.getEle(element)[index];
      const ele = this.get;
      ele.eventList = [];
      return this;
    };
    //选择子级元素
    this.child = name => {
      const ele = this.get;
      if (ele.querySelectorAll(name).length > 1) {
        this.get = ele.querySelectorAll(name);
      } else {
        this.get = ele.querySelector(name);
      }
      return this;
    };
    //选择父级元素
    this.parent = () => {
      const ele = this.get;
      this.get = ele.parentElement;
      return this;
    };
    //遍历元素集
    this.each = fn => {
      const ele = this.get;
      let i = 0;
      for (let a of ele) {
        fn && fn(this.eq(i), i);
        i++;
      }
      return this;
    };
    //获取或修改样式
    this.css = name => {
      const ele = this.get;
      let style = [];
      style = name;
      if (style) {
        if (typeof style === "string") {
          return window.getComputedStyle(ele).getPropertyValue(style);
        } else {
          Object.keys(style).forEach(e => {
            ele.style[e] = style[e];
          });
        }
      }
      return this;
    };
    //获取或插入文本
    this.text = str => {
      const ele = this.get;
      if (str) {
        ele.innerText = str;
      } else {
        return ele.innerText;
      }
      return this;
    };
    //获取或插入HTML
    this.html = content => {
      const ele = this.get;
      if (content) {
        this.empty();
        ele.innerHTML = content;
      } else {
        return ele.innerHTML;
      }
      return this;
    };
    //获取或插入值
    this.val = value => {
      const ele = this.get;
      value && (ele.value = value);
      return ele.value;
    };
    //插入元素
    this.prepend = target => {
      const ele = this.get;
      const Thetarget = `${target}${ele.innerHTML}`;
      ele.innerHTML = Thetarget;
      return this;
    };
    this.append = target => {
      const ele = this.get;
      const Thetarget = `${ele.innerHTML}${target}`;
      ele.innerHTML = Thetarget;
      return this;
    };
    //清空容器
    this.empty = () => {
      const ele = this.get;
      while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
      }
      return this;
    };
    //移除元素
    this.remove = () => {
      const ele = this.get;
      ele.parentElement.removeChild(ele);
      return this;
    };
    //添加class
    this.addClass = name => {
      const ele = this.get;
      const beforeClass = ele.classList.value;
      if (beforeClass) {
        ele.className = `${beforeClass} ${name.trim()}`;
      } else {
        ele.className = name.trim();
      }
      return this;
    };
    //移除class
    this.removeClass = name => {
      const ele = this.get;
      const removeThat = ele => {
        let beforeClass = ele.classList.value.split(" "),
          afterClass;
        beforeClass.map((cur, idx) => {
          if (cur === name) beforeClass.splice(idx, 1);
        });
        afterClass = beforeClass.join(" ");
        ele.className = afterClass;
      };
      if (ele.length) {
        for (let e of ele) removeThat(e);
      } else {
        removeThat(ele);
      }
      return this;
    };
    //是否拥有class名
    this.hasClass = name => {
      const ele = this.get;
      const classlist =
        ele.classList.value.indexOf(" ") > -1
          ? ele.classList.value.split(" ")
          : ele.classList.value;
      if (classlist.indexOf(name) > -1) {
        return !0;
      } else {
        return !1;
      }
    };
    //添加属性
    this.attr = (name, val) => {
      const ele = this.get;
      if (val) {
        ele.setAttribute(name, val);
        return this;
      } else {
        return ele.getAttribute(name);
      }
    };
    //移除属性
    this.removeAttr = name => {
      const ele = this.get;
      ele.removeAttribute(name);
      return this;
    };
    //绑定事件
    this.bind = (eventName, fn, bool = !1) => {
      const ele = this.get;
      ele.addEventListener(eventName, fn, bool);
      ele.eventList.push({ name: eventName, callback: fn });
      return this;
    };
    //解绑事件
    this.unbind = eventName => {
      const ele = this.get;
      ele.eventList.map((e, i) => {
        if (e.name === eventName) {
          ele.removeEventListener(eventName, e.callback);
          ele.eventList.splice(i, 1);
        }
      });
      return this;
    };
    //添加事件
    this.addEvent = (eventName, fn) => {
      const ele = this.get;
      const addEvent = (ele, index = null) => {
        ele[eventName] = e => {
          let event = e;
          event.current = ele;
          fn(event, index);
        };
      };
      if (ele.length) {
        let index = 0;
        for (let e of ele) {
          addEvent(e, index);
          index++;
        }
      } else {
        addEvent(ele);
      }
    };
    //点击事件
    this.click = fn => {
      this.addEvent("onclick", fn);
      return this;
    };
    //长按事件
    this.taping = fn => {
      const ele = this.get;
      try {
        window.ontouchstart;
      } catch (err) {
        ele.onclick = fn;
        return this;
      }
      let infiniteFrame;
      const infiniteFn = () => {
        fn();
        infiniteFrame = requestAnimationFrame(infiniteFn);
      };
      ele.ontouchstart = () => {
        event.preventDefault();
        cancelAnimationFrame(infiniteFn);
        infiniteFn();
      };
      ele.ontouchend = () => {
        cancelAnimationFrame(infiniteFrame);
        return this;
      };
    };
    //失焦事件
    this.blur = fn => {
      this.addEvent("onblur", fn);
      return this;
    };
    //聚焦事件
    this.focus = fn => {
      this.addEvent("onfocus", fn);
      return this;
    };
    //改变事件
    this.change = fn => {
      this.addEvent("onchange", fn);
      return this;
    };
    //输入事件
    this.input = fn => {
      this.addEvent("oninput", fn);
      return this;
    };
    //悬浮事件
    this.hover = (In, Out) => {
      this.addEvent("onmouseover", In);
      Out && this.addEvent("onmouseout", Out);
      return this;
    };
    //滚动事件
    this.scroll = fn => {
      this.addEvent("onscroll", fn);
      return this;
    };
    //过渡结束事件
    this.ontransition = fn => {
      const ele = this.get;
      try {
        window.ontransitionend;
      } catch (err) {
        return !1;
      }
      ele.addEventListener("transitionend", fn);
      return this;
    };
    //动画结束事件
    this.animated = fn => {
      const ele = this.get;
      let isAnimated = !1;
      ele.addEventListener("animationend", () => {
        if (!isAnimated) {
          isAnimated = !0;
          fn();
        }
      });
      return this;
    };
    //显示
    this.show = callback => {
      if (this.attr("beforeHide")) {
        this.css({ display: this.attr("beforeHide") });
      } else {
        this.css({ display: "block" });
      }
      callback && setTimeout(callback, 0);
      return this;
    };
    //隐藏
    this.hide = callback => {
      if (!this.attr("beforeHide"))
        this.attr("beforeHide", this.css("display"));
      this.css({ display: "none" });
      callback && setTimeout(callback, 0);
      return this;
    };
    //ajax
    this.ajax = options => {
      let config = {
        //接口地址(类型：字符串)
        url: null,
        //请求类型(类型：字符串；可选参数：post、get)
        type: "get",
        //是否同步请求(类型：布尔)
        async: !1,
        //发送数据类型(类型：字符串；可选参数：json、form)
        dataType: "json",
        //发送数据(类型：json或form；格式必须和发送数据类型保持一致)
        data: null,
        //成功回调方法(类型：方法；返回类型：对象)
        success: null,
        //失败回调方法(类型：方法)
        error: null,
      };
      config = this.extend(config, options);
      const http = new XMLHttpRequest();
      let params;
      if (config.dataType == "json") {
        if (config.data)
          params = Object.keys(config.data)
            .map(key => {
              return `${encodeURIComponent(key)}=${encodeURIComponent(
                config.data[key]
              )}`;
            })
            .join("&");
      } else {
        params = config.data;
      }

      http.onload = () => {
        if (
          http.status === 200 ||
          http.statusText === "OK" ||
          http.readyState === 4
        ) {
          const res = http.response;
          try {
            JSON.parse(res);
          } catch (err) {
            config.success && config.success(res);
            return !1;
          }
          config.success && config.success(JSON.parse(res));
        }
      };
      http.onerror = config.error || null;
      http.open(config.type.toUpperCase(), config.url, config.async);
      if (config.dataType == "json")
        http.setRequestHeader(
          "Content-type",
          "application/x-www-form-urlencoded"
        );
      http.send(params);
    };
    //fetch
    this.fetch = options => {
      let config = {
        //接口地址(类型：字符串)
        url: null,
        //请求头(类型：对象)
        headers: null,
        //请求类型(类型：字符串；可选参数：post、get、put)
        type: "get",
        //发送数据(类型：JSON或FormData；格式必须和请求类型相对应)
        data: null,
        //成功回调方法(类型：方法；返回类型：对象)
        success: null,
        //失败回调方法(类型：方法)
        error: null,
      };
      config = this.extend(config, options);
      let params;
      if (config.dataType == "json") {
        config.data && (params = JSON.stringify(config.data));
      } else {
        params = config.data;
      }

      fetch(config.url, {
        body: params,
        headers: config.headers || {
          "Content-type": "application/x-www-form-urlencoded",
        },
        method: config.type.toLocaleUpperCase(),
      })
        .then(res => {
          if (res.ok) return res.json();
        })
        .then(success => {
          config.success && config.success(success);
        })
        .catch(error => {
          config.error && config.error(error);
        });
    };
    //全局变量
    this.globalData = {};
    //设置全局变量
    this.setData = obj => {
      return new Promise((success, fail) => {
        try {
          for (let key in obj) this.globalData[key] = obj[key];
          success();
        } catch (err) {
          fail(err);
        }
      });
    };
    //模板渲染
    this.template = (route, container) => {
      return new Promise((success, fail) => {
        const temp = (() => {
          let cur;
          let temp = document.querySelectorAll("template");
          for (let a = 0; a < temp.length; a++) {
            if (temp[a].getAttribute("route") == route) cur = temp[a];
          }
          return cur;
        })();

        if (temp) {
          this.empty();
          container.appendChild(document.importNode(temp.content, !0));
          success();
        } else {
          console.error(`不存在以下路由模板：${route}`);
          fail();
        }
      });
    };
    // 获取url参数并转换成对象
    this.getParams = () => {
      let url = location.href.split("?");
      if (location.href.indexOf("?") > -1) {
        let obj = {};
        if (url[1].split("&")) {
          let params = url[1].split("&");
          params.map(v => {
            obj[v.split("=")[0]] = v.split("=")[1];
          });
        } else {
          obj[url[1].split("=")[0]] = obj[url[1].split("=")[1]];
        }
        return obj;
      } else {
        return null;
      }
    };
    // HASH改变
    this.hashChange = callback => {
      const getRoutePath = () => {
        if (location.hash.indexOf("#") > -1) {
          return location.hash.match(/#(\S*)\?/) == null
            ? location.hash.match(/#(\S*)/)[1]
            : location.hash.match(/#(\S*)\?/)[1];
        } else {
          return !1;
        }
      };
      const routePath = getRoutePath();
      if (routePath) {
        callback(routePath);
      } else {
        callback("/");
      }
    };
  }
};
//拓展方法
const PandoraJs = (SuperClass = null) => {
  SuperClass = SuperClass || class Empty {};
  return class extends SuperClass {
    constructor(element) {
      super(element);
    }
    //Mustache渲染
    Mush(options) {
      let config = {
        //渲染数据(类型：对象)
        data: null,
        //事件绑定(类型：方法)
        Bind: null,
        //生命周期-首次渲染完成(类型：方法；返回当前渲染数据)
        Init: null,
        // 生命周期-更新渲染完成(类型：方法)
        Update: null,
      };
      config = this.extend(config, options);
      let Html = this.html(),
        bHtml = Html,
        pattern = new RegExp("{{.*?}}", "g"),
        patterns = new RegExp("{{.*?}}"),
        matchValue;

      const result = () => {
        let r = [];
        Html.match(pattern).forEach((e, index) => {
          r[index] = e.split("{{")[1].split("}}")[0];
        });
        return r;
      };
      matchValue = result();

      //渲染html
      const renderHtml = () => {
        return new Promise(next => {
          Html = bHtml;
          for (let value of matchValue) {
            for (let keyName in config.data)
              value === keyName &&
                (Html = Html.replace(patterns, config.data[value] || ""));
          }
          this.html(Html);
          config.Bind && eval(config.Bind);
          next();
        });
      };

      //遍历变量是否被动态修改
      const unique = array => {
        let r = [];
        for (let i = 0, l = array.length; i < l; i++) {
          for (let j = i + 1; j < l; j++) array[i] == array[j] && j == ++i;
          r.push(array[i]);
        }
        return r;
      };

      const realVal = unique(matchValue);

      realVal.forEach(e => {
        Object.defineProperty(this.globalData, e, {
          set: value => {
            config.data[e] = value;
            renderHtml();
            config.Update && config.Update();
          },
          get: () => {
            return config.data[e];
          },
        });
      });

      renderHtml();
      config.Init && config.Init(this.globalData);
      return this;
    }
    //静态路由
    Router(options) {
      let config = {
        // 路由路径集合(类型：数组)
        routes: null,
      };
      config = this.extend(config, options);
      const that = this;
      let fromParams;
      templatePolyfill();

      // 遍历路由路径
      const eachRoutes = path => {
        return new Promise((success, fail) => {
          if (config.routes && path) {
            if (JSON.stringify(config.routes).indexOf(path) < 0) {
              fail(`${path} 不存在于routes！`);
            } else {
              config.routes.forEach(e => {
                if (path == e.path) {
                  that
                    .template(path, that.get)
                    .then(() => {
                      let query = fromParams || that.getParams();
                      e.callback && e.callback(query);
                      success();
                    })
                    .catch(() => {
                      e.error && e.error();
                    });
                }
              });
            }
          }
        });
      };

      // 路由导航
      this.navigateTo = path => {
        return new Promise((success, fail = null) => {
          eachRoutes(path)
            .then(() => {
              window.location.href = `#${path}`;
              success();
            })
            .catch(() => {
              console.error("路由地址不存在于routes！");
              fail && fail();
            });
        });
      };

      if (config.routes) {
        let newUrl = location.href.replace(location.search, "");
        fromParams = that.getParams();
        window.history.pushState(null, "", newUrl);

        window.onload = () => {
          that.hashChange(eachRoutes);
        };
        window.onhashchange = () => {
          that.hashChange(eachRoutes);
        };
      }
      return this;
    }
    //NEW: 文件路由
    filesRouter(options) {
      let config = {
        routes: null,
      };
      config = this.extend(config, options);
      const that = this;
      let fromParams;

      // 遍历路由路径
      const eachRoutes = path => {
        return new Promise((success, fail) => {
          if (config.routes && path) {
            if (JSON.stringify(config.routes).indexOf(path) < 0) {
              fail(`${path} 不存在于routes！`);
            } else {
              config.routes.forEach(e => {
                if (path == e.path) {
                  that.ajax({
                    url: `${path}.tmp`,
                    success(html) {
                      that.empty();
                      that.html(html);
                      const Nodes = that.get.querySelectorAll("*");

                      Nodes.forEach(e => {
                        let script = document.createElement("script");
                        if (e.tagName.toLowerCase() == "script") {
                          if (e.src) {
                            script.src = e.src;
                          } else {
                            script.innerHTML = e.innerHTML;
                          }
                          e.parentElement.removeChild(e);
                          that.get.appendChild(script);
                        }
                      });

                      let query = fromParams || that.getParams();
                      e.callback && e.callback(query);
                      success();
                    },
                    fail() {
                      e.error && e.error();
                    },
                  });
                }
              });
            }
          }
        });
      };

      if (config.routes) {
        let newUrl = location.href.replace(location.search, "");
        fromParams = that.getParams();
        window.history.pushState(null, "", newUrl);

        window.onload = () => {
          that.hashChange(eachRoutes);
        };
        window.onhashchange = () => {
          that.hashChange(eachRoutes);
        };
      }

      return this;
    }
    //轮播切换
    Switcher(options) {
      let config = {
        //过渡速度/秒(类型：数字)
        Speed: 1,
        //动画曲线(类型：字符串；参考css3动画曲线)
        Curve: "ease",
        //切换效果(类型：字符串；可选参数：slider、fade)
        Effect: "slider",
        //方向(类型：字符串；可选参数：horizontal、vertical)
        Direction: "horizontal",
        //惯性回弹(类型：布尔)
        Inertia: true,
        //滑动比例(类型：数字)
        Distance: 3,
        //自动切换间隔/秒(类型：数字；为0时不自动切换)
        AutoSpeed: 0,
        //分页器(类型：布尔)
        Pagination: !1,
        //悬浮停止(类型：布尔)
        Hover: !1,
        //滚轮滚动(类型：布尔)
        Scroll: !1,
        //初始坐标(类型：数字)
        InitPage: 0,
        //循环(类型：布尔)
        Loop: !1,
        //切换状态变化(类型：方法)
        onChange: null,
      };
      const that = this;
      config = that.extend(config, options);
      const childEle = this.get,
        parentEle = childEle[0].parentElement;
      let childW = childEle[0].offsetWidth,
        childH = childEle[0].offsetHeight,
        cur = config.InitPage,
        AutoTimeout,
        isScrolling = !1;
      const total = childEle.length,
        transitionend = () => {
          if (isScrolling) {
            isScrolling = !1;
            parentEle.removeEventListener("transitionend", transitionend);
          }
        };

      //切换
      const Swiper = (moveTo = null) => {
        moveTo && (cur = moveTo);
        Pagination(cur);
        config.onChange && config.onChange(cur);
        switch (config.Effect) {
          case "fade":
            for (let cur of childEle) cur.style.opacity = 0;
            childEle[cur].style.opacity = 1;
            break;
          default:
            switch (config.Direction) {
              case "horizontal":
                parentEle.style.transform = `translate3d(${
                  -1 * (childW * cur)
                }px,0,0)`;
                break;
              case "vertical":
                parentEle.style.transform = `translate3d(0,${
                  -1 * (childH * cur)
                }px,0)`;
                break;
            }
            break;
        }
        if (config.Loop) {
          parentEle.addEventListener("transitionend", transitionend);
        } else {
          if (cur === 0 || cur === total - 1) {
            transitionend();
          } else {
            parentEle.addEventListener("transitionend", transitionend);
          }
        }
      };

      //分页器
      const Pagination = current => {
        for (let e of childEle)
          e.className = e.className.replace("active", "").trim();
        if (childEle[cur].className) {
          childEle[cur].className += " active";
        } else {
          childEle[cur].className += "active";
        }
        if (config.Pagination) {
          if (parentEle.parentElement.querySelector(".Pd-pagination")) {
            parentEle.parentElement.removeChild(
              parentEle.parentElement.querySelector(".Pd-pagination")
            );
          }
          let pager = document.createElement("div");
          pager.className = "Pd-pagination";

          for (let a = 0; a < total; a++) {
            let pageChild = document.createElement("a"),
              textNode = childEle[a].getAttribute("data-title")
                ? document.createTextNode(
                    childEle[a].getAttribute("data-title")
                  )
                : document.createTextNode(a);
            pageChild.setAttribute("href", "javascript:void 0");
            if (a === current) pageChild.className = "active";
            pageChild.appendChild(textNode);
            pager.appendChild(pageChild);
          }
          parentEle.parentElement.insertBefore(
            pager,
            parentEle.nextElementSibling
          );
          for (
            let a = 0;
            a <
            parentEle.parentElement
              .querySelector(".Pd-pagination")
              .querySelectorAll("a").length;
            a++
          ) {
            let e = parentEle.parentElement
              .querySelector(".Pd-pagination")
              .querySelectorAll("a")[a];
            let idx = a;
            e.onclick = () => {
              cur = idx;
              Swiper();
            };
          }
        }
      };

      //上一个
      const Prev = () => {
        if (cur < total && cur > 0) {
          cur--;
        } else if (cur === 0 && config.Loop) {
          cur = total - 1;
        } else {
          isScrolling = !1;
        }
        Swiper();
      };

      //下一个
      const Next = () => {
        if (cur < total - 1) {
          cur++;
        } else if (cur === total - 1 && config.Loop) {
          cur = 0;
        } else {
          cur = total - 1;
        }
        Swiper();
      };

      this.prev = Prev;
      this.next = Next;
      this.direct = Swiper;

      let startX, startY, endX, endY, curX, curY;
      //方法：滑动开始
      const touchStart = event => {
        if (
          event.target.getAttribute("data-cancel") ||
          event.target.tagName.toUpperCase() == "A"
        )
          return !1;
        event.preventDefault();
        clearTimeout(AutoTimeout);
        cancelAnimationFrame(AutoPlayFrame);
        let { pageX, pageY } = event.changedTouches[0];
        let { left, top } = parentEle.parentElement.getBoundingClientRect();
        switch (config.Direction) {
          case "horizontal":
            startX = pageX - left;
            break;
          case "vertical":
            startY = pageY - top;
            break;
        }
        parentEle.style.transition = null;
      };

      //方法：滑动中
      const touchMove = event => {
        if (
          event.target.getAttribute("data-cancel") ||
          event.target.tagName.toUpperCase() == "A"
        )
          return !1;
        let { pageX, pageY } = event.changedTouches[0];
        let { left, top } = parentEle.parentElement.getBoundingClientRect();
        curX = pageX - left;
        curY = pageY - top;
        switch (config.Effect) {
          case "fade":
            for (let cur of childEle)
              cur.style.transition = `opacity ${config.Speed}s linear`;
            break;
          default:
            switch (config.Direction) {
              case "horizontal":
                if (startX > curX) {
                  parentEle.style.transform = `translate3d(${
                    -1 * (startX - curX + childW * cur)
                  }px,0,0)`;
                } else {
                  parentEle.style.transform = `translate3d(${
                    -1 * (childW * cur) + Math.abs(curX - startX)
                  }px,0,0)`;
                }
                break;
              case "vertical":
                if (startY > curY) {
                  if (cur != total - 1)
                    parentEle.style.transform = `translate3d(0,${
                      -1 * (startY - curY + childH * cur)
                    }px,0)`;
                } else {
                  if (cur != 0)
                    parentEle.style.transform = `translate3d(0,${
                      -1 * (childH * cur) + Math.abs(curY - startY)
                    }px,0)`;
                }
                break;
            }
            break;
        }
      };

      //方法：滑动结束
      const touchEnd = event => {
        if (
          event.target.getAttribute("data-cancel") ||
          event.target.tagName.toUpperCase() == "A"
        )
          return !1;
        clearTimeout(AutoTimeout);
        AutoPlay();
        parentEle.style.transition = `transform ${config.Speed}s ${config.Curve}`;
        let { pageX, pageY } = event.changedTouches[0];
        let { left, top } = parentEle.parentElement.getBoundingClientRect();
        switch (config.Direction) {
          case "horizontal":
            endX = pageX - left;
            switch (config.Effect) {
              case "fade":
                if (
                  startX - endX > childW / config.Distance &&
                  cur === total - 1
                ) {
                  cur = 0;
                } else if (
                  startX - endX > childW / config.Distance &&
                  cur < total - 1
                ) {
                  Next();
                } else if (endX - startX > childW / config.Distance) {
                  Prev();
                }
                for (let cur of childEle) {
                  cur.style.transition = `opacity ${config.Speed}s ${config.Curve}`;
                  cur.style.opacity = 0;
                }
                childEle[cur].style.opacity = 1;
                Swiper();
                break;
              default:
                if (startX - endX > childW / config.Distance && cur < total - 1)
                  Next();
                if (endX - startX > childW / config.Distance) Prev();
                parentEle.style.transform = `translate3d(${
                  -1 * (childW * cur)
                }px,0,0)`;
                break;
            }
            break;
          case "vertical":
            endY = pageY - top;
            switch (config.Effect) {
              case "fade":
                if (
                  startY - endY > childH / config.Distance &&
                  cur === total - 1
                ) {
                  cur = 0;
                } else if (
                  startY - endY > childH / config.Distance &&
                  cur < total - 1
                ) {
                  Next();
                } else if (endY - startY > childH / config.Distance) {
                  Prev();
                }
                for (let cur of childEle) {
                  cur.style.transition = `opacity ${config.Speed}s ${config.Curve}`;
                  cur.style.opacity = 0;
                }
                childEle[cur].style.opacity = 1;
                Swiper();
                break;
              default:
                if (startY - endY > childH / config.Distance && cur < total - 1)
                  Next();
                if (endY - startY > childH / config.Distance) Prev();
                parentEle.style.transform = `translate3d(0,${
                  -1 * (childH * cur)
                }px,0)`;
                break;
            }
            break;
        }
      };

      //方法：滚动中
      const scrollMove = event => {
        event.preventDefault();
        if (event.deltaY > 20 && !isScrolling) {
          isScrolling = !0;
          Next();
        }
        if (event.deltaY < -20 && !isScrolling) {
          isScrolling = !0;
          Prev();
        }
      };

      //自动播放
      let AutoPlayFrame;
      const AutoPlay = () => {
        if (config.AutoSpeed > 0) {
          AutoTimeout = setTimeout(() => {
            Next();
            clearTimeout(AutoTimeout);
            AutoPlayFrame = requestAnimationFrame(AutoPlay);
          }, config.AutoSpeed * 1000);
        }
      };

      //初始化
      const Init = () => {
        let { offsetWidth, offsetHeight } = childEle[0];
        childW = offsetWidth;
        childH = offsetHeight;
        cur = config.InitPage;

        new Promise(next => {
          switch (config.Effect) {
            case "fade":
              for (let cur of childEle) {
                cur.style.transition = `opacity ${config.Speed}s ${config.Curve}`;
                cur.style.position = "absolute";
              }
              break;
            default:
              switch (config.Direction) {
                case "horizontal":
                  parentEle.style.flexDirection = "row";
                  parentEle.style.width = `${childW * total}px`;
                  break;
                case "vertical":
                  parentEle.style.flexDirection = "column";
                  parentEle.style.height = `${childH * total}px`;
                  break;
              }
              parentEle.style.display = "flex";
              parentEle.style.transition = `transform ${config.Speed}s ${config.Curve}`;
              break;
          }
          next();
        })
          .then(() => {
            return new Promise(next => {
              //移除事件
              Swiper(config.InitPage);
              AutoPlay();
              config.Inertia &&
                parentEle.removeEventListener("touchmove", touchMove);
              config.Scroll &&
                parentEle.removeEventListener("mousewheel", scrollMove);
              parentEle.removeEventListener("touchstart", touchStart);
              parentEle.removeEventListener("touchend", touchEnd);
              next();
            });
          })
          .then(() => {
            //添加事件
            config.Inertia &&
              parentEle.addEventListener("touchmove", touchMove);
            config.Scroll &&
              parentEle.addEventListener("mousewheel", scrollMove);
            parentEle.addEventListener("touchstart", touchStart);
            parentEle.addEventListener("touchend", touchEnd);
            if (config.Hover) {
              parentEle.addEventListener("mouseover", () => {
                clearTimeout(AutoTimeout);
                cancelAnimationFrame(AutoPlayFrame);
              });
              parentEle.addEventListener("mouseout", AutoPlay);
            }
          });
      };

      Init();
      let req;
      window.addEventListener("resize", () => {
        cancelAnimationFrame(req);
        req = requestAnimationFrame(Init);
      });
      return this;
    }
    //字体自适应
    AutoSize(options) {
      let config = {
        //固定尺寸(类型：字符串)
        PageSize: "device-width",
        //初始缩放(类型：数字)
        InitScale: 1,
        //最小缩放(类型：数字)
        MinScale: 1,
        //最大缩放(类型：数字)
        MaxScale: 1,
        //DPI缩放(类型：数字)
        Ratio: 1,
      };
      config = this.extend(config, options);
      const meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      if (typeof config.PageSize !== "number") {
        meta.setAttribute(
          "content",
          `width=${config.PageSize},initial-scale=${config.InitScale},minimum-scale=${config.MinScale},maximum-scale=${config.MaxScale},user-scalable=no,viewport-fit=cover`
        );
      } else {
        meta.setAttribute(
          "content",
          `width=${config.PageSize},user-scalable=no,viewport-fit=cover`
        );
      }
      new PandoraAPI("head").get.appendChild(meta);

      const SetSize = () => {
        let platform = navigator.userAgent.toLowerCase(),
          deviceList = ["iphone", "android"],
          isMobile = !1;

        deviceList.forEach(c => {
          if (isMobile) return !1;
          if (platform.indexOf(c) > 0 && config.PageSize !== "device-width") {
            isMobile = !0;
            let calcFontSize = (window.screen.width / 3.75) * config.Ratio;
            this.css({ "font-size": `${calcFontSize}px` });
          } else {
            isMobile = !1;
            this.css({ "font-size": this.css("font-size") });
          }
          this.attr("isMobile", isMobile);
        });
      };
      SetSize();
      window.onresize = SetSize;
      return this;
    }
    //自定义弹框
    Dialog(options) {
      let config = {
        //是否显示遮罩
        mask: !0,
        //遮罩颜色(类型：字符串)
        maskColor: "rgba(0,0,0,.85)",
        //点击遮罩退出(类型：布尔)
        maskOut: !0,
        //过渡速度/毫秒(类型：数字)
        Speed: 180,
        //过渡曲线(类型：字符串；参考CSS3可用曲线)
        Curve: "ease-out",
        //进出方式(类型：字符串；none:无、zoom:缩放、top:从屏幕上方出现、bottom:从屏幕下方出现)
        Direction: "zoom",
        //进入事件(类型：方法)
        In: null,
        //退出事件(类型：方法)
        Out: null,
        //确认事件
        Confirm: {
          //确定按钮(类型：字符串)
          btn: null,
          //回调(类型：方法；返回类型：对象)
          callback: null,
        },
        //取消事件
        Cancel: {
          //取消按钮(类型：字符串)
          btn: null,
          //回调(类型：方法；返回类型：对象)
          callback: null,
        },
      };
      config = this.extend(config, options);
      let mask = document.createElement("div"),
        parent = this.get.parentElement;
      mask.className = "Pd-Mask";
      const confirmBtn = config.Confirm.btn
          ? new PandoraAPI(config.Confirm.btn)
          : null,
        cancelBtn = config.Cancel.btn
          ? new PandoraAPI(config.Cancel.btn)
          : null;

      if (config.Direction !== "none")
        this.css({ transition: `all ${config.Speed}ms ${config.Curve}` });

      //关闭弹框
      const closeDialog = () => {
        Effect("out");
        if (config.Direction === "none") {
          config.mask && parent.removeChild(mask);
          this.css({ display: "none" });
          this.unbind("transitionend");
        } else {
          this.bind("transitionend", () => {
            config.mask && parent.removeChild(mask);
            this.css({ display: "none" });
            this.unbind("transitionend");
          });
        }
        config.Confirm.btn && confirmBtn.unbind("click");
        config.Cancel.btn && cancelBtn.unbind("click");
        window.onresize = null;
      };

      //进入和退出效果
      const Effect = where => {
        if (config.mask) {
          parent.insertBefore(mask, this.get.nextElementSibling);
          new PandoraAPI(".Pd-Mask").css({
            width: "100vw",
            height: "100vh",
            background: config.maskColor,
            position: "fixed",
            top: 0,
            left: 0,
            "z-index": 998,
          });
        }

        switch (where) {
          case "in":
            this.css({ display: "block" });
            switch (config.Direction) {
              case "zoom":
                this.css({ transform: "translate3d(0,0,0) scale(0)" });
                break;
              case "top":
                this.css({ transform: "translate3d(0,-100%,0)" });
                break;
              case "bottom":
                this.css({ transform: "translate3d(0,100%,0)" });
                break;
            }
            config.In && config.In();
            break;
          case "out":
            switch (config.Direction) {
              case "none":
                this.css({ display: "none" });
                break;
              case "zoom":
                this.css({ transform: "translate3d(0,0,0) scale(0)" });
                break;
              case "top":
                this.css({ transform: "translate3d(0,-100%,0)" });
                break;
              case "bottom":
                this.css({ transform: "translate3d(0,100%,0)" });
                break;
            }
            config.Out && config.Out();
            break;
        }
      };

      const openDialog = param => {
        new Promise(next => {
          Effect("in");
          next();
        })
          .then(() => {
            return new Promise(next => {
              const calcDialog = () => {
                let top = parseInt(this.css("height")) / 2,
                  left = parseInt(this.css("width")) / 2;
                switch (config.Direction) {
                  case "none":
                    this.css({
                      position: "fixed",
                      top: `calc(50% - ${top}px)`,
                      left: `calc(50% - ${left}px)`,
                      "z-index": 999,
                      transform: "translate3d(0,0,0) scale(1)",
                    });
                    break;
                  case "zoom":
                    this.css({
                      position: "fixed",
                      top: `calc(50% - ${top}px)`,
                      left: `calc(50% - ${left}px)`,
                      "z-index": 999,
                      transform: "translate3d(0,0,0) scale(1)",
                    });
                    break;
                  case "top":
                    this.css({
                      position: "fixed",
                      top: 0,
                      left: `calc(50% - ${left}px)`,
                      "z-index": 999,
                      transform: "translate3d(0,0,0) scale(1)",
                    });
                    break;
                  case "bottom":
                    this.css({
                      position: "fixed",
                      bottom: 0,
                      left: `calc(50% - ${left}px)`,
                      "z-index": 999,
                      transform: "translate3d(0,0,0) scale(1)",
                    });
                    break;
                }
              };
              calcDialog();
              window.onresize = () => {
                this.ontransition(calcDialog);
              };
              next();
            });
          })
          .then(() => {
            //遮罩被点击
            if (config.mask && config.maskOut) mask.onclick = closeDialog;
            const { close } = this;
            //确认按钮被点击
            config.Confirm.btn &&
              confirmBtn.bind("click", () => {
                config.Confirm.callback({ param: param || null, close });
              });
            //取消按钮被点击
            config.Cancel.btn &&
              cancelBtn.bind("click", () => {
                config.Cancel.callback({ param: param || null, close });
              });
          });
      };

      this.close = closeDialog;
      this.open = openDialog;
      return this;
    }
    //图片预加载
    ImgLoader(options) {
      let config = {
        //缓步(类型：布尔)
        lazy: !0,
        //加载中(类型：方法；返回类型：数字)
        loading: null,
        //加载完成(类型：方法)
        callback: null,
        //加载错误(类型：方法)
        error: () => {
          console.error("图片资源加载错误");
          alert("图片资源加载错误");
        },
      };
      config = this.extend(config, options);
      const $ = this.getEle("*"),
        pattern = new RegExp('".*?"', "g"),
        pattern2 = new RegExp(/'.*?'/, "g"),
        pattern3 = new RegExp(/\(.*?\)/, "g");
      let ImgArr = [],
        total = 0,
        cur = 0,
        step = 0,
        floatNum = 0;

      for (let e of $) {
        if (e.nodeName.toLowerCase() == "img") e.src && ImgArr.push(e.src);
        const getBg = window
          .getComputedStyle(e)
          .getPropertyValue("background-image");
        if (getBg.indexOf("url") > -1 && getBg != "none") {
          const url1 = getBg.match(pattern),
            url2 = getBg.match(pattern2),
            url3 = getBg.match(pattern3);

          if (url1) ImgArr.push(url1[0].toString().replace(/"/g, ""));
          if (url2) ImgArr.push(url2[0].toString().replace(/'/g, ""));
          if (url3) {
            let src = url3[0].toString().replace(/\(/, "");
            src = src.replace(/\)/, "");
            if (src.match(pattern))
              src = src.match(pattern)[0].toString().replace(/"/g, "");
            if (src.match(pattern2))
              src = src.match(pattern2)[0].toString().replace(/'/g, "");
            ImgArr.push(src);
          }
        }
      }

      let loaderList = [];
      total = ImgArr.length;

      const loader = src => {
        return new Promise((success, fail) => {
          let img = new Image();
          img.src = src;

          img.onerror = fail;

          if (img.complete) {
            cur++;
            success();
          } else {
            img.onload = () => {
              cur++;
              success();
            };
          }
        });
      };

      ImgArr.map(e => {
        loaderList.push(loader(e));
      });

      //加载中
      let loadingFrame, loadStepFrame;

      Promise.all(loaderList)
        .then(() => {
          !config.lazy && config.callback && config.callback();
        })
        .catch(() => {
          config.error();
          cancelAnimationFrame(loadingFrame);
          cancelAnimationFrame(loadStepFrame);
        });

      const loading = () => {
        step = (cur / total) * 100;
        if (step < 100) {
          if (step === 100) {
            cancelAnimationFrame(loadingFrame);
          } else {
            loadingFrame = requestAnimationFrame(loading);
          }
        }
      };
      const loadStep = () => {
        if (floatNum < 100) {
          if (floatNum < step) floatNum++;
          this.attr("Pd-load", floatNum);
          config.loading && config.loading(floatNum);
          if (floatNum === 100) {
            cancelAnimationFrame(loadStepFrame);
            config.lazy && config.callback && config.callback();
          } else {
            loadStepFrame = requestAnimationFrame(loadStep);
          }
        }
      };
      loading();
      loadStep();
      return this;
    }
    //图片上传
    ImgUpload(options) {
      let config = {
        //接口地址(类型：字符串)
        apiUrl: "//node.pandorastudio.cn/",
        //接口名称(类型：字符串)
        apiName: "Pd_uploadImage",
        //格式限制(类型：字符串)
        Format: "*",
        //选择类型(可选参数：default、camera)
        type: "default",
        //限制数量(类型：数字)
        Max: 1,
        //压缩比例(类型：数字)
        Quality: 100,
        //尺寸裁切
        Clip: {
          //宽度(类型：数字)
          width: null,
          //高度(类型：数字)
          height: null,
        },
        //上传事件
        Events: {
          //超过限制(类型：方法)
          overMax: null,
          //开始上传(类型：方法)
          ready: null,
          //上传成功(类型：方法；返回类型：对象)
          success: null,
          //失败(类型：方法)
          fail: null,
        },
        //唯一id(类型：字符串；如果为null，则启用临时上传，请谨慎使用)
        Uid: null,
      };
      config = this.extend(config, options);
      const innerHtml = this.html();
      this.empty();
      this.get.insertAdjacentHTML(
        "afterbegin",
        `<label for="Pd_imgUpload_${this.pid}" style="width:100%;height:100%;display:block;"></label>`
      );
      let uploadBtn = document.createElement("input"),
        userId,
        total = config.Max,
        current = 0,
        steps = (current / total) * 100;
      if (config.Uid) {
        userId = config.Uid;
      } else {
        userId = `${document.domain}_${this.pid}`;
      }

      uploadBtn.type = "file";
      uploadBtn.accept = `image/${config.Format}`;
      uploadBtn.id = `Pd_imgUpload_${this.pid}`;
      if (config.type === "camera") uploadBtn.setAttribute("capture", "camera");
      uploadBtn.style.display = "none";
      if (config.Max > 1) uploadBtn.multiple = !0;
      this.get.querySelector("label").innerHTML = innerHtml;
      this.get.querySelector("label").append(uploadBtn);

      //上传图片
      const uploadPreview = obj => {
        let formData = new FormData();
        formData.append("images", obj);
        formData.append("uid", userId);
        formData.append("width", config.Clip.width);
        formData.append("height", config.Clip.height);
        formData.append("quality", config.Quality);

        if (config.Events.ready) {
          config.Events.ready();
        } else {
          !config.Events.ready && window.showLoading();
        }

        this.ajax({
          url: `${config.apiUrl}${config.apiName}`,
          async: !0,
          type: "post",
          dataType: "form",
          data: formData,
          success: res => {
            current++;
            steps = (current / total) * 100;
            uploadBtn.setAttribute("data-progress", steps);
            if (steps === 100) {
              uploadBtn.disabled = !1;
              let data = { src: res.images };
              uploadBtn.value = "";
              !config.Events.ready && window.hideLoading();
              config.Events.success && config.Events.success(data);
            }
          },
          error: () => {
            uploadBtn.disabled = !1;
            uploadBtn.value = "";
            !config.Events.ready && window.hideLoading();
            config.Events.fail && config.Events.fail();
          },
        });
      };

      //获取选择文件
      const selectedFile = Files => {
        let files = Array.prototype.slice.call(Files);
        if (config.Max === 0 || files.length <= config.Max) {
          current = 0;
          uploadBtn.disabled = !0;
          total = files.length;

          if (total > 0) {
            files.forEach((file, idx) => {
              uploadPreview(Files[idx]);
            });
          }
        } else {
          config.Events.overMax && config.Events.overMax();
          console.info(`文件数量超过最大数量:${config.Max}`);
        }
      };

      //选择文件按钮事件
      uploadBtn.addEventListener("change", event => {
        event.preventDefault();
        selectedFile(event.target.files);
      });
      //拖动文件事件
      this.bind("dragover", event => {
        event.preventDefault();
      });
      this.bind("drop", event => {
        event.preventDefault();
        selectedFile(event.dataTransfer.files);
      });
      return this;
    }
    //图片移动缩放
    ImgTransit(options) {
      let config = {
        //显示控制图标(类型：布尔)
        icon: !0,
        //控制图标大小(类型：数字)
        iconSize: 40,
        //显示边框(类型：布尔)
        border: !0,
        //内边距(类型：数字)
        padding: 0,
        //缩放
        scale: {
          //是否启用(类型：布尔)
          enable: !0,
          //最小(类型：数字)
          min: 50,
          //最大(类型：数字)
          max: 200,
          //速率(类型：数字)
          rate: 1,
        },
        //是否移动(类型：布尔)
        move: !0,
        //旋转
        rotate: {
          //是否启用(类型：布尔)
          enable: !0,
          //速率(类型：数字)
          rate: 1,
        },
        //是否启用删除(类型：布尔)
        delete: !0,
        //边界限制(类型：布尔)
        bounds: !0,
        //边界可超出范围(类型：数字)
        outBounds: 0,
        //操作回调方法(类型：方法；返回类型：对象)
        callback: null,
      };
      config = this.extend(config, options);
      let imgRealArr = this.get.querySelectorAll("img"),
        beforeImgArr = Array.prototype.slice.call(imgRealArr),
        imgArr = [],
        imgIndex = [],
        btnAnimation = "transition:opacity .2s ease-in",
        topIndex,
        canMove = !0;

      this.css({
        position: "relative",
      });

      beforeImgArr.forEach((cur, idx) => {
        if (JSON.parse(cur.getAttribute("Pd-move"))) {
          imgIndex.push(idx);
          imgArr.push(cur);
        }
      });
      topIndex = imgArr.length;

      //图标配置
      const iconStyle = option => {
        let posicfg = {
          top: null,
          left: null,
          right: null,
          bottom: null,
          name: null,
        };
        posicfg = this.extend(posicfg, option);
        return `<a class="Pd-ImgTransit-btn Pd-${posicfg.name}" style="width:${config.iconSize}px;height:${config.iconSize}px;background:#fff url('//b.pandorajs.com/Pandora/Pandora/src/${posicfg.name}.svg');background-position:center;background-repeat:no-repeat;background-size:65%;position:absolute;border-radius:50%;top:${posicfg.top}px;left:${posicfg.left}px;right:${posicfg.right}px;bottom:${posicfg.bottom}px;z-index:2;${btnAnimation}" href="javascript:void 0"></a>`;
      };

      const icon = {
        resize: iconStyle({
          left: `-${config.iconSize / 2}`,
          bottom: `-${config.iconSize / 2}`,
          name: "resize",
        }),
        rotate: iconStyle({
          right: `-${config.iconSize / 2}`,
          top: `-${config.iconSize / 2}`,
          name: "rotate",
        }),
        delete: iconStyle({
          left: `-${config.iconSize / 2}`,
          top: `-${config.iconSize / 2}`,
          name: "delete",
        }),
      };

      //删除原始元素
      const deleteDefault = () => {
        let imgRealArr = this.get.querySelectorAll("img"),
          imgArr = Array.prototype.slice.call(imgRealArr);
        imgArr.forEach((cur, idx) => {
          let current = imgRealArr[idx];
          JSON.parse(current.getAttribute("Pd-move")) &&
            current.parentElement.removeChild(current);
        });
      };

      //设置参数
      const setConfig = (ele, eleConfig) => {
        for (let a of ele.querySelectorAll(".Pd-ImgTransit-btn"))
          a.style.transform = `scale(${1 / (eleConfig.scale / 100)}) rotate(${
            -1 * eleConfig.rotate
          }deg)`;
        return (ele.style.transform = `translate3d(${
          eleConfig.translate
        }) scale(${eleConfig.scale / 100}) rotate(${eleConfig.rotate}deg)`);
      };

      //获取中心
      const getCenterPoint = ele => {
        return {
          x: ele.getBoundingClientRect().left + ele.offsetWidth / 2,
          y: ele.getBoundingClientRect().top + ele.offsetHeight / 2,
        };
      };

      //添加容器事件
      const addEvent = ele => {
        let eleReal = this.get.querySelectorAll(`.Pd-ImgTransit`),
          eleArr = Array.prototype.slice.call(eleReal),
          eleConfig = [];

        eleArr.forEach((cur, idx) => {
          let w = ele[idx].width,
            h = ele[idx].height;
          eleConfig.push({ translate: `0,0,0`, scale: 100, rotate: 0 });
          eleReal[idx].style.width = `${w}px`;
          eleReal[idx].style.height = `${h}px`;
          setConfig(eleReal[idx], eleConfig[idx]);
          eleReal[idx].style.position = "absolute";
          eleReal[idx].style.top = "50%";
          eleReal[idx].style.left = "50%";
          eleReal[idx].style.margin = `-${h / 2 + config.padding}px 0 0 -${
            w / 2 + config.padding
          }px`;
          eleReal[idx].style.zIndex = idx + 1;
          eleReal[idx].style.padding = `${config.padding}px`;

          let touchStart,
            touchEnd,
            touchMove,
            touchResize,
            touchRotate,
            touchDelete,
            centerPoint,
            prevAngle,
            touchX = 0,
            touchY = 0,
            startX,
            startY,
            prevScale;

          touchStart = event => {
            event.preventDefault();
            if (
              JSON.parse(event.target.getAttribute("pd-move")) ||
              JSON.parse(event.target.parentElement.getAttribute("pd-move"))
            )
              eleReal[idx].querySelector("img").style.transform = "scale(1.04)";
            config.callback &&
              config.callback({
                type: "choose",
                obj: eleReal[idx],
              });
          };
          touchEnd = event => {
            event.preventDefault();
            eleReal[idx].querySelector("img").style.transform = "scale(1)";
          };
          //移动事件
          touchMove = event => {
            if (event.touches.length < 2) {
              event.stopImmediatePropagation();
              event.preventDefault();
              const changePosition = () => {
                let nowX = event.changedTouches[0].pageX,
                  nowY = event.changedTouches[0].pageY,
                  w = event.target.getBoundingClientRect().width,
                  h = event.target.getBoundingClientRect().height,
                  icon = event.target.parentElement
                    .querySelectorAll(".Pd-ImgTransit-btn")[0]
                    .getBoundingClientRect(),
                  iconW = icon.width / 2;
                touchX = nowX - startX;
                touchY = nowY - startY;
                let getBounding = eleReal[
                    idx
                  ].parentElement.getBoundingClientRect(),
                  parentBox = {
                    width: config.bounds
                      ? getBounding.width + config.outBounds
                      : getBounding.width,
                    height: config.bounds
                      ? getBounding.height + config.outBounds
                      : getBounding.height,
                  };

                if (config.bounds) {
                  if (Math.abs(touchX) >= parentBox.width / 2 - w / 2 - iconW) {
                    if (touchX < 0) {
                      touchX = -1 * (parentBox.width / 2 - w / 2 - iconW);
                    } else {
                      touchX = parentBox.width / 2 - w / 2 - iconW;
                    }
                  }
                  if (
                    Math.abs(touchY) >=
                    parentBox.height / 2 - h / 2 - iconW
                  ) {
                    if (touchY < 0) {
                      touchY = -1 * (parentBox.height / 2 - h / 2 - iconW);
                    } else {
                      touchY = parentBox.height / 2 - h / 2 - iconW;
                    }
                  }
                }
                eleConfig[idx].translate = `${touchX}px,${touchY}px,0`;
                setConfig(eleReal[idx], eleConfig[idx]);
              };
              config.callback &&
                config.callback({ type: "move", obj: eleReal[idx] });
              canMove && changePosition();
            }
          };
          //缩放事件
          touchResize = event => {
            event.stopImmediatePropagation();
            event.preventDefault();
            if (canMove) {
              let x =
                event.changedTouches[0].pageX -
                eleReal[idx].getBoundingClientRect().left;
              if (x > 0 && eleConfig[idx].scale > config.scale.min) {
                eleConfig[idx].scale -= config.scale.rate;
              }
              if (x < 0 && eleConfig[idx].scale < config.scale.max) {
                eleConfig[idx].scale += config.scale.rate;
              }
            }

            if (event.touches.length >= 2) {
              if (config.scale.enable) {
                if (event.scale > prevScale) {
                  if (eleConfig[idx].scale < config.scale.max)
                    eleConfig[idx].scale += event.scale;
                } else {
                  if (eleConfig[idx].scale > config.scale.min)
                    eleConfig[idx].scale -= event.scale * 10;
                }
              }

              if (config.rotate.enable) {
                if (event.rotation > 0) {
                  eleConfig[idx].rotate += Math.abs(event.rotation) / 30;
                } else {
                  eleConfig[idx].rotate -= Math.abs(event.rotation) / 30;
                }
              }
            }
            setConfig(eleReal[idx], eleConfig[idx]);
            config.callback &&
              config.callback({ type: "resize", obj: eleReal[idx] });
          };
          //旋转事件
          touchRotate = event => {
            event.stopImmediatePropagation();
            event.preventDefault();
            const changeRotate = () => {
              let angle = Math.atan2(
                event.changedTouches[0].pageY - centerPoint.y,
                event.changedTouches[0].pageX - centerPoint.x
              );
              eleConfig[idx].rotate =
                Math.floor(((angle - prevAngle) * 180) / Math.PI) *
                config.rotate.rate;
              setConfig(eleReal[idx], eleConfig[idx]);
            };
            config.callback &&
              config.callback({ type: "rotate", obj: eleReal[idx] });
            canMove && changeRotate();
          };
          //删除事件
          touchDelete = event => {
            event.stopImmediatePropagation();
            event.preventDefault();
            const deleteObj = () => {
              eleConfig[idx].translate = "0,0,0";
              eleConfig[idx].rotate = 0;
              eleConfig[idx].scale = 100;
              setConfig(eleReal[idx], eleConfig[idx]);
              eleReal[idx].style.display = "none";
              config.callback &&
                config.callback({ type: "delete", obj: eleReal[idx] });
            };
            canMove && deleteObj();
          };
          //绑定所有操作
          eleReal[idx].addEventListener("touchstart", touchStart);
          eleReal[idx].addEventListener("touchend", touchEnd);
          if (config.move) {
            eleReal[idx].addEventListener("touchstart", event => {
              if (event.touches.length < 2) {
                startX = event.changedTouches[0].pageX - touchX;
                startY = event.changedTouches[0].pageY - touchY;
                eleReal[idx].addEventListener("touchmove", touchMove);
              }
            });
          }
          if (config.icon && config.scale.enable)
            eleReal[idx]
              .querySelectorAll(`.Pd-resize`)[0]
              .addEventListener("touchmove", touchResize);
          if (config.icon && config.rotate.enable) {
            eleReal[idx]
              .querySelectorAll(`.Pd-rotate`)[0]
              .addEventListener("touchstart", event => {
                centerPoint = getCenterPoint(eleReal[idx]);
                prevAngle =
                  Math.atan2(
                    event.changedTouches[0].pageY - centerPoint.y,
                    event.changedTouches[0].pageX - centerPoint.x
                  ) -
                  (eleConfig[idx].rotate * Math.PI) / 180;
              });
            eleReal[idx]
              .querySelectorAll(`.Pd-rotate`)[0]
              .addEventListener("touchmove", touchRotate);
          }
          if (config.icon && config.delete)
            eleReal[idx]
              .querySelectorAll(`.Pd-delete`)[0]
              .addEventListener("touchstart", touchDelete);

          //隐藏操作按钮
          const hideBtn = () => {
            canMove = !1;
            let allCon = document.querySelectorAll(".Pd-ImgTransit"),
              allBtn = document.querySelectorAll(".Pd-ImgTransit-btn");
            for (let a of allCon) a.style.border = "none";
            for (let a of allBtn) a.style.opacity = 0;
          };
          config.icon && hideBtn();

          //显示操作按钮
          const showBtn = tag => {
            canMove = !0;
            let curBtn = tag.querySelectorAll(".Pd-ImgTransit-btn");
            for (let a of curBtn) {
              a.style.opacity = 1;
              if (config.border) tag.style.border = "2px dashed white";
              topIndex++;
              tag.style.zIndex = topIndex;
            }
          };

          //显示当前按钮
          document.addEventListener("touchstart", event => {
            if (config.icon) {
              hideBtn();
              event.stopImmediatePropagation();
              JSON.parse(event.target.getAttribute("pd-move")) &&
                showBtn(event.target);
              if (event.target.parentElement)
                JSON.parse(
                  event.target.parentElement.getAttribute("pd-move")
                ) && showBtn(event.target.parentElement);
            } else {
              if (event.target.parentElement) {
                if (
                  JSON.parse(event.target.parentElement.getAttribute("pd-move"))
                ) {
                  canMove = !0;
                } else {
                  canMove = !1;
                }
              }
            }
          });
        });
      };

      new Promise(next => {
        let eleArr = [];
        imgArr.forEach((current, idx) => {
          let cur = imgRealArr[imgIndex[idx]],
            btn = "";
          if (config.icon) {
            config.scale.enable && (btn += icon.resize);
            config.rotate.enable && (btn += icon.rotate);
            config.delete && (btn += icon.delete);
          }
          this.append(
            `<div class="Pd-ImgTransit" Pd-index="${imgIndex[idx]}">${btn}</div>`
          );
          let imgCon = this.get.querySelectorAll(".Pd-ImgTransit")[idx];
          cur.style.transition = "transform .4s ease-in";
          [].slice.call(cur.attributes).forEach(attrs => {
            if (
              attrs.name !== "style" &&
              attrs.name !== "id" &&
              attrs.name !== "class"
            )
              imgCon.setAttribute(attrs.name, attrs.value);
          });
          imgCon.appendChild(cur);
          cur.removeAttribute("Pd-move");
          eleArr.push(cur);
          next(eleArr);
        });
      }).then(ele => {
        deleteDefault();
        addEvent(ele);
      });
    }
    //微信SDK
    wxSDK(options) {
      let config = {
        //相关接口地址(类型：字符串)
        apiUrl: "//wx.pandorajs.com/wxshare.ashx?url=",
        //分享标题(类型：字符串或数组)
        title: ["Share to Timeline", "Share to Friends"],
        //分享描述(类型：字符串)
        desc: "Simple for this",
        //分享图(类型：字符串或数组)
        sharePics: "https://pandorajs.com/share_ico.jpg",
        //分享链接(类型：字符串或数组)
        shareLinks: location.href,
        //调试(类型：布尔)
        debug: !1,
        //微信jsApiList(类型：数组)
        jsApiList: null,
        //回调方法
        callback: {
          //分享就绪(类型：方法)
          ready: null,
          //分享成功(类型：方法)
          success: null,
          //分享失败或取消(类型：方法)
          error: null,
        },
      };
      config = this.extend(config, options);
      let sdk = "//pandorajs.com/other/weixin.js";
      if (location.protocol === "file:")
        sdk = "//pandorajs.com/other/weixin.js";
      const scriptTag = document.createElement("script");
      scriptTag.id = "Pd_share";
      scriptTag.src = sdk;
      if (this.getEle("#Pd_share")) {
        new PandoraAPI("#Pd_share").remove();
        document.body.appendChild(scriptTag);
      } else {
        document.body.appendChild(scriptTag);
      }
      let jsApiList = [
        "onMenuShareTimeline",
        "onMenuShareAppMessage",
        "updateTimelineShareData",
        "updateAppMessageShareData",
      ];
      if (config.jsApiList) {
        config.jsApiList.map(e => {
          jsApiList.push(e);
        });
      }

      const isObj = con => {
        if (typeof con === "object") {
          return !0;
        } else {
          return !1;
        }
      };

      const success = res => {
        const { appId, timestamp, nonceStr, signature } = res;
        wx.config({
          debug: config.debug,
          appId,
          timestamp,
          nonceStr,
          signature,
          jsApiList,
        });
        wx.ready(() => {
          new Promise(next => {
            const timeLine = {
                title: isObj(config.title) ? config.title[0] : config.title,
                link: isObj(config.shareLinks)
                  ? config.shareLinks[0]
                  : config.shareLinks,
                imgUrl: isObj(config.sharePics)
                  ? config.sharePics[0]
                  : config.sharePics,
              },
              friend = {
                title: isObj(config.title) ? config.title[1] : config.title,
                link: isObj(config.shareLinks)
                  ? config.shareLinks[1]
                  : config.shareLinks,
                imgUrl: isObj(config.sharePics)
                  ? config.sharePics[1]
                  : config.sharePics,
              };

            if (wx.onMenuShareTimeline) {
              const { title, link, imgUrl } = timeLine;
              const { success, error } = config.callback;
              wx.onMenuShareTimeline({ title, link, imgUrl, success, error });
            } else {
              const { title, link, imgUrl } = timeLine;
              const { success, error } = config.callback;
              wx.updateTimelineShareData({
                title,
                link,
                imgUrl,
                success,
                error,
              });
            }

            if (wx.onMenuShareAppMessage) {
              const { title, link, imgUrl } = friend;
              const { success, error } = config.callback;
              wx.onMenuShareAppMessage({
                title,
                desc: config.desc,
                link,
                imgUrl,
                success,
                error,
              });
            } else {
              const { title, link, imgUrl } = friend;
              const { success, error } = config.callback;
              wx.updateAppMessageShareData({
                title,
                desc,
                link,
                imgUrl,
                success,
                error,
              });
            }
            next();
          }).then(config.callback.ready);
        });
      };

      scriptTag.onload = () => {
        this.fetch({
          url: `${config.apiUrl}${encodeURIComponent(location.href)}`,
          success: success,
        });
      };
      return this;
    }
    //懒加载
    LazyLoad(options) {
      let config = {
        //缺省尺寸
        width: 100,
        height: 100,
      };
      config = this.extend(config, options);

      const imgArr = this.child("img").get;
      let cur = 0;
      let lazyArr = [];
      //遍历所有图片
      for (let img of imgArr) {
        if (img.dataset.src) {
          img.width = config.width;
          img.height = config.height;
          lazyArr.push(img);
        }
      }

      //进入视图
      const inView = obj => {
        if (obj.getBoundingClientRect().y - window.innerHeight < 0) return obj;
        return !1;
      };

      //检测图片状态
      const checker = () => {
        lazyArr.forEach(img => {
          if (inView(img) && !img.src && img.complete) {
            img.src = inView(img).dataset.src;
            img.onload = () => {
              img.width = img.dataset.width || img.naturalWidth;
              img.height = img.dataset.height || img.naturalHeight;
              img.removeAttribute("data-src");
              img.dataset.width && img.removeAttribute("data-width");
              img.dataset.height && img.removeAttribute("data-height");
              cur++;
              if (cur == lazyArr.length)
                window.removeEventListener("scroll", checker);
            };

            img.onerror = () => {
              console.error(`以下资源发生错误：${img.src}`);
              cur++;
            };
          }
        });
      };

      //页面滚动事件
      window.addEventListener("scroll", checker);
    }
  };
};

const Pandora = class extends PandoraJs(PandoraAPI) {
  constructor(element) {
    super(element);
  }
};

window.Pandora = Pandora;
try {
  jQuery;
} catch (err) {
  window.$ = element => {
    return new Pandora(element);
  };
}
