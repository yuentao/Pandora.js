const templatePolyfill = require("template-polyfill");
require("core-js/es6/promise");
require("core-js/es6/object");
require("core-js/es6/symbol");
const icoConfig = require("./src/icoConfig.json");

(() => {
  // 启用插件追踪
  window.disableTrack = !0;
  //兼容处理&&基础方法

  // PROTO: 是否符合追踪条件
  const canTrack = () => {
    const domain = document.domain || "local";
    if (
      window.disableTrack &&
      domain.indexOf("pandorajs.com") < 0 &&
      domain.indexOf("192.168") < 0 &&
      domain != "local" &&
      domain != "localhost" &&
      domain != "127.0.0.1"
    ) {
      return !0;
    }
    return !1;
  };

  //PROTO: requestAnimationFrame
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
  if (!getRoot("alertTheme")) rootText += "/*alert背景*/--alertTheme:inherit;";
  if (!getRoot("alertBg")) rootText += "/*alert遮罩*/--alertBg:inherit;";
  if (!getRoot("alertFontSize"))
    rootText += "/*alert字体大小*/--alertFontSize:1rem;";
  if (!getRoot("alertColor")) rootText += "/*alert字体颜色*/--alertColor:#000;";

  if (!getRoot("confirmTheme"))
    rootText += "/*confirm背景*/--confirmTheme:inherit;";
  if (!getRoot("confirmBg")) rootText += "/*confirm遮罩*/--confirmBg:inherit;";
  if (!getRoot("confirmBtnBg"))
    rootText += "/*confirm按钮背景*/--confirmBtnBg:#333366;";
  if (!getRoot("confirmFontSize"))
    rootText += "/*confirm字体大小*/--confirmFontSize:1rem;";
  if (!getRoot("confirmColor"))
    rootText += "/*confirm字体颜色*/--confirmColor:#000;";
  if (!getRoot("confirmBtnColor"))
    rootText += "/*confirm按钮字体颜色*/--confirmBtnColor:#fff;";

  const style = document.createElement("style");
  style.innerHTML = `:root{${rootText}}`;
  document.querySelector("head").appendChild(style);

  //是否已经显示遮罩
  let isMaskShow = !1;
  //PROTO: 修改原生alert
  window.alert = content => {
    let mask = document.createElement("div"),
      maskBg = !isMaskShow ? getRoot("alertBg") : null,
      div = document.createElement("div"),
      msg = document.createElement("p"),
      blur = document.createElement("div"),
      plan = document.createElement("div"),
      timeout,
      Theme = getRoot("alertTheme"),
      fontSize = getRoot("alertFontSize"),
      color = getRoot("alertColor");

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
      background: inherit;
      background: ${maskBg};`;

    div.style.cssText = `
      background: inherit;
      background:${Theme};
      text-align: center;
      color: ${color};
      font-size: ${fontSize};
      padding: 1em 2em;
      line-height: 1.5;
      transition: opacity .4s ease-out;
      margin-bottom:5vh;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      position: relative;
      overflow: hidden;`;

    msg.style.cssText = `
      margin:0;
      position: relative;`;

    blur.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: inherit;
      filter: blur(10px) saturate(2);`;

    plan.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:rgba(255, 255, 255, 0.66);`;

    msg.innerText = content ? content.toString() : "";
    div.appendChild(blur);
    div.appendChild(plan);
    div.appendChild(msg);

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
  };
  //PROTO: 修改原生confirm
  window.confirm = config => {
    let content, confirmText, cancelText, success, fail;
    let mask = document.createElement("div"),
      div = document.createElement("div"),
      blur = document.createElement("div"),
      plan = document.createElement("div"),
      msg = document.createElement("p"),
      confirm = document.createElement("button"),
      cancel = document.createElement("button"),
      maskBg = !isMaskShow ? getRoot("confirmBg") : null,
      btnBg = getRoot("confirmBtnBg"),
      Theme = getRoot("confirmTheme"),
      fontSize = getRoot("confirmFontSize"),
      color = getRoot("confirmColor"),
      btnColor = getRoot("confirmBtnColor");

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
  background: inherit;
  background: ${maskBg};`;

    div.style.cssText = `
  background: inherit;
  background:${Theme};
  text-align: center;
  color: ${color};
  font-size: ${fontSize};
  padding: 1.5em;
  max-width:50vw;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  position: relative;
  overflow: hidden;`;

    blur.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(10px) saturate(2);`;

    plan.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:rgba(255, 255, 255, 0.66);`;

    msg.style.cssText = `margin:0;position: relative;`;
    let buttonCSS = `position: relative;margin: 4em 1em 0 1em;font-size: .8em;appearance: none;background: ${btnBg};color: ${btnColor};border: none;padding: 1em 3em;cursor: pointer;outline: none;`;
    confirm.style.cssText = buttonCSS;
    cancel.style.cssText = buttonCSS;

    const removeConfirm = () => {
      document.body.removeChild(mask);
      isMaskShow = !1;
    };

    const createModel = () => {
      msg.innerText = content ? content.toString() : "";
      div.appendChild(blur);
      div.appendChild(plan);
      div.appendChild(msg);
      confirm.innerText = confirmText ? confirmText.toString() : "确认";
      cancel.innerText = cancelText ? cancelText.toString() : "取消";

      div.appendChild(confirm);
      div.appendChild(cancel);

      mask.appendChild(div);
      document.body.appendChild(mask);
      isMaskShow = !0;
    };

    if (typeof config == "string") {
      content = config;

      createModel();

      return new Promise((ok, no) => {
        confirm.onclick = () => {
          removeConfirm();
          ok();
        };
        cancel.onclick = () => {
          removeConfirm();
          no("[错误] 没有可以执行的回调");
        };
      });
    } else {
      content = config.content;
      confirmText = config.confirmText;
      cancelText = config.cancelText;
      success = config.success;
      fail = config.fail;

      createModel();

      confirm.onclick = () => {
        removeConfirm();
        success && success();
      };
      cancel.onclick = () => {
        removeConfirm();
        fail && fail();
      };
    }
  };
  //PROTO: loading遮罩
  window.showLoading = () => {
    let mask = document.createElement("div");
    let svg = new Image();
    svg.src = icoConfig.load;
    mask.id = "Pd_loader";
    mask.style.cssText =
      "width:100%;height:100%;position: fixed;z-index: 99;top: 0;left: 0;background:rgba(0,0,0,.65);display:flex;align-items: center; justify-content: center;";

    document.querySelector("#Pd_loader") &&
      document.body.removeChild(document.querySelector("#Pd_loader"));
    mask.appendChild(svg);
    document.body.appendChild(mask);
  };
  window.hideLoading = () => {
    document.querySelector("#Pd_loader") &&
      document.body.removeChild(document.querySelector("#Pd_loader"));
  };

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
          console.error(`[错误] 没有找到名称为 ${this.element} 的元素`);
          return !1;
        }
      };
      this.get = this.init();
      //PROTO: 生产PandoraId
      this.pid = `PandoraAPI_${new Date().getTime()}`;
      //PROTO: 默认参数赋值
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
      //PROTO: 选择指定下标元素
      this.eq = index => {
        this.get = this.getEle(element)[index];
        !this.get && console.error("[错误] 没有找到该下标");
        return this;
      };
      //PROTO: 选择子级元素
      this.child = name => {
        const ele = this.get;
        this.get = ele.querySelectorAll(name);
        this.get.length == 0 && console.error("[错误] 没有找到该子级");
        return this;
      };
      //PROTO: 选择父级
      this.parent = () => {
        const ele = this.get;
        this.get = ele.parentElement;
        return this;
      };
      //PROTO: 选择其他同级元素
      this.siblings = name => {
        const ele = this.get;
        const parent = this.parent();
        ele.selected = !0;
        let siblingArr = [];

        for (let e of parent.child(name).get) {
          !e.selected && siblingArr.push(e);
        }
        this.get = siblingArr;
        return this;
      };
      //PROTO: 选择上一个同级元素
      this.prev = () => {
        const ele = this.get;
        this.get = ele.previousElementSibling;
        return this;
      };
      //PROTO: 选择下一个同级元素
      this.next = () => {
        const ele = this.get;
        this.get = ele.nextElementSibling;
        return this;
      };
      //PROTO: 遍历元素集
      this.each = fn => {
        const ele = this.get;
        let i = 0;
        for (let a of ele) {
          fn && fn(this.eq(i), i);
          i++;
        }
        return this;
      };
      //PROTO: 获取或修改样式
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
      //PROTO: 获取或插入文本
      this.text = str => {
        const ele = this.get;
        if (str != undefined) {
          ele.innerText = str.toString();
        } else {
          return ele.innerText;
        }
        return this;
      };
      //PROTO: 获取或插入HTML
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
      //PROTO: 获取或插入值
      this.val = value => {
        const ele = this.get;
        if (value != null && value != undefined) {
          ele.value = value;
        }
        return ele.value;
      };
      //PROTO: 插入元素
      this.prepend = target => {
        const ele = this.get;
        if (ele.length) {
          for (let e of ele) {
            const Thetarget = `${target}${e.innerHTML}`;
            e.innerHTML = Thetarget;
          }
        } else {
          const Thetarget = `${target}${ele.innerHTML}`;
          ele.innerHTML = Thetarget;
        }
        return this;
      };
      this.append = target => {
        const ele = this.get;
        if (ele.length) {
          for (let e of ele) {
            if (typeof target == "object") {
              e.appendChild(target);
            } else {
              e.innerHTML += target;
            }
          }
        } else {
          if (typeof target == "object") {
            ele.appendChild(target);
          } else {
            ele.innerHTML += target;
          }
        }
        return this;
      };
      //PROTO: 清空容器
      this.empty = () => {
        const ele = this.get;
        while (ele.firstChild) {
          ele.removeChild(ele.firstChild);
        }
        return this;
      };
      //PROTO: 移除元素
      this.remove = () => {
        const ele = this.get;
        try {
          ele.parentElement.removeChild(ele);
        } catch (err) {
          console.error("[错误] 没有找到可以移除的元素");
        }
        return this;
      };
      //PROTO: 添加class
      this.addClass = name => {
        const ele = this.get;
        const addThat = ele => {
          const beforeClass = ele.classList.value;
          if (beforeClass) {
            if (beforeClass.indexOf(name) < 0)
              ele.className = `${beforeClass} ${name.trim()}`;
          } else {
            ele.className = name.trim();
          }
        };
        if (ele.length > 1) {
          for (let a of ele) addThat(a);
        } else {
          addThat(ele);
        }
        return this;
      };
      //PROTO: 移除class
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
      //PROTO: 是否拥有class名
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
      //PROTO: 添加属性
      this.attr = (inject, val) => {
        const ele = this.get;
        if (typeof inject == "object") {
          for (let keyName in inject) {
            ele.setAttribute(keyName, inject[keyName]);
          }
          return this;
        } else {
          if (val) {
            ele.setAttribute(inject, val);
            return this;
          } else {
            return ele.getAttribute(inject);
          }
        }
      };
      //PROTO: 移除属性
      this.removeAttr = name => {
        const ele = this.get;
        ele.removeAttribute(name);
        return this;
      };
      //PROTO: 绑定事件
      this.bind = (eventName, fn, bool = !1) => {
        const ele = this.get;
        ele.addEventListener(eventName, fn, bool);
        ele.eventList.push({ name: eventName, callback: fn });
        return this;
      };
      //PROTO: 解绑事件
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
      //PROTO: 添加事件
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
      //PROTO: 点击事件
      this.click = fn => {
        this.addEvent("onclick", fn);
        return this;
      };
      //PROTO: 长按事件
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
      //PROTO: 聚焦事件
      this.focus = fn => {
        this.addEvent("onfocus", fn);
        return this;
      };
      //PROTO: 改变事件
      this.change = fn => {
        this.addEvent("onchange", fn);
        return this;
      };
      //PROTO: 输入事件
      this.input = fn => {
        this.addEvent("oninput", fn);
        return this;
      };
      //PROTO: 悬浮事件
      this.hover = (In, Out) => {
        this.addEvent("onmouseover", In);
        Out && this.addEvent("onmouseout", Out);
        return this;
      };
      //PROTO: 滚动事件
      this.scroll = fn => {
        this.addEvent("onscroll", fn);
        return this;
      };
      //PROTO: 过渡结束事件
      this.transitionEnd = fn => {
        try {
          window.ontransitionend;
          this.addEvent("transitionend", fn);
        } catch (err) {
          console.error("[错误] 不支持ontransitionend事件");
          return !1;
        }
        return this;
      };
      //PROTO: 动画结束事件
      this.animationEnd = fn => {
        try {
          this.addEvent("animationend", fn);
        } catch (err) {
          console.error("[错误] 不支持animationend事件");
          return !1;
        }
        return this;
      };
      //PROTO: 显示
      this.show = callback => {
        if (this.attr("beforeHide")) {
          this.css({ display: this.attr("beforeHide") });
        } else {
          this.css({ display: "block" });
        }
        callback && setTimeout(callback, 0);
        return this;
      };
      //PROTO: 隐藏
      this.hide = callback => {
        if (!this.attr("beforeHide"))
          this.attr("beforeHide", this.css("display"));
        this.css({ display: "none" });
        callback && setTimeout(callback, 0);
        return this;
      };
      //PROTO: ajax
      this.ajax = options => {
        let config = {
          //接口地址(类型：字符串)
          url: null,
          //请求类型(类型：字符串；可选参数：post、get)
          type: "get",
          //是否同步请求(类型：布尔)
          async: !1,
          //设置请求头(类型：对象)
          headers: null,
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

        if (config.headers) {
          for (let keys of config.headers) {
            http.setRequestHeader(keys, config.headers[keys]);
          }
        } else {
          if (config.dataType == "json")
            http.setRequestHeader(
              "Content-type",
              "application/x-www-form-urlencoded"
            );
        }

        http.send(params);
      };
      //PROTO: fetch
      this.fetch = options => {
        let config = {
          //接口地址(类型：字符串)
          url: null,
          //设置请求头(类型：对象)
          headers: { "Content-Type": "application/json" },
          //请求类型(类型：字符串；可选参数：post、get)
          type: "get",
          //发送数据(类型：JSON)
          data: null,
          //成功回调方法(类型：方法；返回类型：对象)
          success: null,
          //失败回调方法(类型：方法)
          error: null,
        };
        config = this.extend(config, options);
        let params;
        config.data && (params = JSON.stringify(config.data));

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
            console.error("[错误] 请求地址发生错误！");
            config.error && config.error(error);
          });
      };
      //PROTO: 表单序列化
      this.serialize = () => {
        const ele = this.get;
        let obj = {};
        for (let e of ele.querySelectorAll("*")) {
          const keyName = e.getAttribute("name");
          if (keyName) {
            obj[keyName] = e.value;
          }
        }
        return obj;
      };
      //PROTO: 使用追踪
      this.usingTrack = fnName => {
        const form = navigator.userAgent,
          domain = document.domain;
        if (canTrack()) {
          console.info(
            "[提示] 已启用使用情况跟踪，如需关闭请修改 window.disableTrack"
          );
          this.fetch({
            url: `https://api.pandorajs.com/Pd_track?usageFunction=${fnName}&usagePlatform=${form}&usageDomain=${domain}`,
          });
        }
      };
      //PROTO: 全局变量
      this.globalData = {};
      //PROTO: 设置全局变量
      this.setData = obj => {
        return new Promise((success, fail) => {
          try {
            for (let key in obj) this.globalData[key] = obj[key];
            success();
          } catch (err) {
            console.error("[错误] 动态变量修改失败！");
            fail(err);
          }
        });
      };
      //PROTO: 模板渲染
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
            console.error(`[错误] 不存在以下路由模板：${route}`);
            fail();
          }
        });
      };
      //PROTO: 获取url参数并转换成对象
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
  const PandoraJs = SuperClass => {
    return class extends SuperClass {
      constructor(element) {
        super(element);
      }
      //FUNCTION:Mustache渲染
      Mush(options) {
        this.usingTrack("Mush");
        let config = {
          //渲染数据(类型：对象)
          data: null,
          //生命周期-首次渲染完成(类型：方法；返回初始渲染数据)
          Init: null,
          // 生命周期-每次更新渲染完成(类型：方法；返回最新渲染数据)
          Update: null,
        };
        config = this.extend(config, options);
        let Html = this.html(),
          bHtml = Html,
          pattern = new RegExp("{{.*?}}", "g"),
          patterns = new RegExp("{{.*?}}"),
          matchValue;

        // 重构渲染数据
        const getObj = res => {
          let newObj = {};
          for (let keyName of Object.keys(res)) {
            newObj[keyName] = res[keyName];
          }
          return newObj;
        };

        // 获取所有MUSH变量
        const getMush = () => {
          let r = [];
          Html.match(pattern).forEach((e, index) => {
            r[index] = e.split("{{")[1].split("}}")[0];
          });
          return r;
        };
        matchValue = getMush();

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
            next();
          });
        };

        // 返回所有唯一变量
        const unique = array => {
          let r = [];
          for (let i = 0, l = array.length; i < l; i++) {
            for (let j = i + 1; j < l; j++) array[i] == array[j] && j == ++i;
            r.push(array[i]);
          }
          return r;
        };

        const realVal = unique(matchValue);

        //遍历变量是否被动态修改
        realVal.forEach(e => {
          Object.defineProperty(this.globalData, e, {
            set: value => {
              config.data[e] = value;
              renderHtml();
              config.Update && config.Update(getObj(this.globalData));
            },
            get: () => {
              return config.data[e];
            },
            // 是否枚举
            enumerable: !0,
          });
        });

        renderHtml();
        config.Init && config.Init(getObj(this.globalData));
        return this;
      }
      //FUNCTION:静态路由
      Router(options) {
        this.usingTrack("Router");
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
                fail(`[错误 - Router] ${path} 不存在于routes！`);
              } else {
                config.routes.forEach(e => {
                  if (path == e.path) {
                    that
                      .template(path, that.get)
                      .then(() => {
                        let query = fromParams || that.getParams();
                        e.callback && e.callback(query);
                        window.location.href = `#${path}`;
                        success();
                        setTimeout(() => {
                          isNavigate = !1;
                        }, 0);
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

        // 是否使用导航
        let isNavigate = !1;
        // 路由导航
        this.navigateTo = path => {
          isNavigate = !0;
          eachRoutes(path);
        };

        if (config.routes) {
          fromParams = that.getParams();

          window.onload = () => {
            that.hashChange(eachRoutes);
          };
          window.onhashchange = () => {
            if (!isNavigate) {
              that.hashChange(eachRoutes);
            }
          };
        }
        return this;
      }
      //TODO:文件路由
      filesRouter(options) {
        this.usingTrack("filesRouter");
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
                fail(`[错误 - filesRouter] ${path} 不存在于routes！`);
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
      //FUNCTION:轮播切换
      Switcher(options) {
        this.usingTrack("Switcher");
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
          Inertia: !0,
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
                  if (
                    startX - endX > childW / config.Distance &&
                    cur < total - 1
                  )
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
                  if (
                    startY - endY > childH / config.Distance &&
                    cur < total - 1
                  )
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
      //FUNCTION:字体自适应
      AutoSize(options) {
        this.usingTrack("AutoSize");
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
      //FUNCTION:自定义弹框
      Dialog(options) {
        this.usingTrack("Dialog");
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
                  this.transitionEnd(calcDialog);
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
      //FUNCTION:图片预加载
      ImgLoader(options) {
        this.usingTrack("ImgLoader");
        let config = {
          //缓步(类型：布尔)
          lazy: !0,
          //加载中(类型：方法；返回类型：数字)
          loading: null,
          //加载完成(类型：方法)
          callback: null,
          //加载错误(类型：方法)
          error: () => {
            console.error("[错误 - ImgLoader] 图片资源加载错误");
            alert("图片资源加载错误");
          },
        };
        config = this.extend(config, options);
        const pattern = new RegExp('".*?"', "g"),
          pattern2 = new RegExp(/'.*?'/, "g"),
          pattern3 = new RegExp(/\(.*?\)/, "g");
        let ImgArr = [],
          total = 0,
          cur = 0,
          step = 0,
          floatNum = 0;

        for (let e of this.getEle("*")) {
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

        //加载中
        let loadStepFrame;

        Promise.all(ImgArr.map(e => loader(e))).catch(() => {
          cancelAnimationFrame(loadStepFrame);
          config.error();
        });

        const loadStep = () => {
          step = (cur / total) * 100;
          if (floatNum < 100) {
            if (floatNum < step) config.lazy ? floatNum++ : (floatNum = step);
            this.attr("Pd-load", floatNum);
            config.loading && config.loading(floatNum);
            if (floatNum === 100) {
              cancelAnimationFrame(loadStepFrame);
              if (config.lazy) {
                config.callback && config.callback();
              } else {
                setTimeout(config.callback, 100);
              }
            } else {
              loadStepFrame = requestAnimationFrame(loadStep);
            }
          }
        };
        loadStep();
        return this;
      }
      //FUNCTION:图片上传
      ImgUpload(options) {
        this.usingTrack("ImgUpload");
        let config = {
          //接口地址(类型：字符串)
          apiUrl: "https://api.pandorajs.com/",
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
          //是否总是覆盖
          alwaysCover: !1,
          //上传事件
          Events: {
            //超过限制(类型：方法)
            overMax: null,
            //开始上传(类型：方法)
            ready: null,
            //上传成功(类型：方法；返回类型：对象)
            success: null,
            //失败(类型：方法)
            fail() {
              console.error("[错误 - ImgUpload] 图片上传失败！");
            },
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
        if (config.type === "camera")
          uploadBtn.setAttribute("capture", "camera");
        uploadBtn.style.display = "none";
        if (config.Max > 1) uploadBtn.multiple = !0;
        const label = this.get.querySelector("label");
        label.innerHTML = innerHtml;
        label.append(uploadBtn);

        //上传图片
        const uploadPreview = obj => {
          const formData = new FormData();
          let waitUploadFile = obj;
          if (config.alwaysCover)
            waitUploadFile = new File(
              [obj],
              `cover.${obj.name.split(".")[1]}`,
              {
                type: obj.type,
              }
            );
          formData.append("images", waitUploadFile);
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
              if (res) {
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
              } else {
                alert("发生错误！");
                console.error("[错误 - ImgUpload] 服务端数据返回有误！");
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
            console.info(
              `[提示 - ImgUpload] 文件数量超过最大数量:${config.Max}`
            );
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
      //FUNCTION:图片移动缩放
      ImgTransit(options) {
        this.usingTrack("ImgTransit");
        let config = {
          //显示控制图标(类型：布尔)
          icon: !0,
          //控制图标大小(类型：数字)
          iconSize: 40,
          //显示边框(类型：布尔)
          border: !0,
          //开启多点触控(类型：布尔)
          Gesture: !1,
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
          let positionConfig = {
            top: null,
            left: null,
            right: null,
            bottom: null,
            name: null,
          };
          positionConfig = this.extend(positionConfig, option);
          return `<a class="Pd-ImgTransit-btn Pd-${
            positionConfig.name
          }" style="width:${config.iconSize}px;height:${
            config.iconSize
          }px;background:#fff url('${
            icoConfig[positionConfig.name]
          }');background-position:center;background-repeat:no-repeat;background-size:65%;position:absolute;border-radius:50%;top:${
            positionConfig.top
          }px;left:${positionConfig.left}px;right:${
            positionConfig.right
          }px;bottom:${
            positionConfig.bottom
          }px;z-index:2;${btnAnimation}" href="javascript:void 0"></a>`;
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

        // 获取两点距离
        const getDistance = (p1, p2) => {
          let x = p2.pageX - p1.pageX,
            y = p2.pageY - p1.pageY;
          return Math.sqrt(x * x + y * y);
        };

        // 获取两点角度
        const getAngle = (p1, p2) => {
          let x = p1.pageX - p2.pageX,
            y = p1.pageY - p2.pageY;
          return (Math.atan2(y, x) * 180) / Math.PI;
        };

        // 多点触控
        const setGesture = el => {
          let obj = {}; //定义一个对象
          let isTouch = !1;
          let start = [];
          el.addEventListener(
            "touchstart",
            e => {
              if (e.touches.length >= 2) {
                //判断是否有两个点在屏幕上
                isTouch = !0;
                start = e.touches; //得到第一组两个点
                obj.gesturestart && obj.gesturestart.call(el); //执行gesturestart方法
              }
            },
            !1
          );
          document.addEventListener(
            "touchmove",
            e => {
              e.preventDefault();
              if (e.touches.length >= 2 && isTouch) {
                let now = e.touches; //得到第二组两个点
                let scale =
                  getDistance(now[0], now[1]) / getDistance(start[0], start[1]); //得到缩放比例，getDistance是勾股定理的一个方法
                let rotation =
                  getAngle(now[0], now[1]) - getAngle(start[0], start[1]); //得到旋转角度，getAngle是得到夹角的一个方法
                e.scale = scale.toFixed(2);
                e.rotation = rotation.toFixed(2);
                obj.gesturemove && obj.gesturemove.call(el, e); //执行gesturemove方法
              }
            },
            !1
          );
          document.addEventListener(
            "touchend",
            e => {
              if (isTouch) {
                isTouch = !1;
                obj.gestureend && obj.gestureend.call(el); //执行gestureend方法
              }
            },
            !1
          );
          return obj;
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
              prevScale = 100;

            touchStart = event => {
              event.preventDefault();
              if (
                JSON.parse(event.target.getAttribute("pd-move")) ||
                JSON.parse(event.target.parentElement.getAttribute("pd-move"))
              )
                eleReal[idx].querySelector("img").style.transform =
                  "scale(1.04)";
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
                    if (
                      Math.abs(touchX) >=
                      parentBox.width / 2 - w / 2 - iconW
                    ) {
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
                  prevScale = event.scale * 100;
                  eleConfig[idx].scale = prevScale;
                }

                if (config.rotate.enable) {
                  eleConfig[idx].rotate = event.rotation;
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
            if (config.scale.enable && config.rotate.enable && config.Gesture) {
              setGesture(eleReal[idx]).gesturemove = e => {
                touchResize(e);
                touchRotate(e);
              };
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
                    JSON.parse(
                      event.target.parentElement.getAttribute("pd-move")
                    )
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
            let theImg = new Image();
            theImg.src = cur.src;

            theImg.onload = () => {
              next(eleArr);
            };

            theImg.error = () => {
              console.error("[错误 - ImgTransit] 图片加载失败！");
            };
          });
        }).then(ele => {
          deleteDefault();
          addEvent(ele);
        });
      }
      //FUNCTION:微信SDK
      wxSDK(options) {
        this.usingTrack("wxSDK");
        let sharePics;
        let hasIcon = !1;
        document.querySelectorAll("link").forEach(tag => {
          if (tag.getAttribute("rel") == "shortcut icon") {
            sharePics = tag.href;
            hasIcon = !0;
          }
        });

        let config = {
          //相关接口地址(类型：字符串)
          apiUrl: "https://wx.pandorajs.com/wxshare.ashx?url=",
          //分享sdk版本
          sdk: "https://res.wx.qq.com/open/js/jweixin-1.6.0.js",
          //分享标题(类型：字符串或数组)
          title: ["Share to Timeline", "Share to Friends"],
          //分享描述(类型：字符串)
          desc: "Simple this",
          //分享图(类型：字符串或数组)
          sharePics: sharePics || "https://pandorajs.com/share_ico.jpg",
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
        const scriptTag = document.createElement("script");
        scriptTag.id = "Pd_share";
        scriptTag.src = config.sdk;
        if (this.getEle("#Pd_share")) new PandoraAPI("#Pd_share").remove();
        document.body.appendChild(scriptTag);

        if (!hasIcon) {
          const link = document.createElement("link");
          link.rel = "shortcut icon";
          link.href = config.sharePics;
          link.type = "image/x-icon";
          document.querySelector("head").appendChild(link);
          console.warn("[警告] 没有检测到分享图标将使用默认值！");
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
                  desc: config.desc,
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
                const { title, link, imgUrl, desc } = friend;
                const { success, error } = config.callback;
                wx.onMenuShareAppMessage({
                  title,
                  desc,
                  link,
                  imgUrl,
                  success,
                  error,
                });
              } else {
                const { title, link, imgUrl, desc } = friend;
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
            success,
          });
        };
        return this;
      }
      //FUNCTION:懒加载
      LazyLoad(options) {
        this.usingTrack("LazyLoad");
        let config = {
          //缺省尺寸
          width: 100,
          height: 100,
          //缺省图标(类型：字符串)
          icon: icoConfig.load,
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
            img.style.background = `url("${config.icon}") no-repeat center,black`;
            img.style.backgroundSize = `20%`;
            lazyArr.push(img);
          }
        }

        //进入视图
        const inView = obj => {
          if (obj.getBoundingClientRect().y - window.innerHeight < 0)
            return obj;
          return !1;
        };

        //检测图片状态
        const checker = () => {
          lazyArr.forEach(img => {
            if (inView(img) && !img.src && img.complete) {
              img.src = inView(img).dataset.src;
              img.style.transition = "all .8s ease";

              img.onload = () => {
                let newWidth = Number(img.dataset.width) || img.naturalWidth,
                  newHeight = Number(img.dataset.height) || img.naturalHeight;

                if (img.dataset.width)
                  newHeight = (newWidth / img.naturalWidth) * img.naturalHeight;
                if (img.dataset.height)
                  newWidth = (newHeight / img.naturalHeight) * img.naturalWidth;

                img.width = newWidth;
                img.height = newHeight;
                img.removeAttribute("data-src");
                img.style.background = null;
                img.dataset.width && img.removeAttribute("data-width");
                img.dataset.height && img.removeAttribute("data-height");
                cur++;
                if (cur == lazyArr.length)
                  window.removeEventListener("scroll", checker);

                img.addEventListener("transitionend", () => {
                  img.style.transition = null;
                });
              };

              img.onerror = () => {
                console.error(`[错误 - LazyLoad] 以下资源发生错误：${img.src}`);
                cur++;
              };
            }
          });
        };

        //页面滚动事件
        window.addEventListener("scroll", checker);
        checker();
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
    console.warn("[警告] 检测到当前页面已使用JQuery,请使用 new Pandora()");
  } catch (err) {
    window.$ = element => {
      return new Pandora(element);
    };
  }
})();
