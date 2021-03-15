const templatePolyfill = require("template-polyfill");
require("core-js/es6/promise");
require("core-js/es6/object");
require("core-js/es6/symbol");
require("core-js/es6/array");
require("core-js/es6/string");
const icoConfig = require("./src/icoConfig.json");
// 缺省字段
const Alphabet = ["active", "local", "localhost", "pandorajs.com", "127.0.0.1", "192.168", "inherit", "提示", "错误", "警告"];

(() => {
  //兼容处理&&基础方法
  // 启用插件追踪
  window.enableTrack = !0;

  // 是否符合追踪条件
  const canTrack = () => {
    const domain = document.domain || Alphabet[1];
    if (window.enableTrack && domain.indexOf(Alphabet[3]) < 0 && domain.indexOf(Alphabet[5]) < 0 && domain != Alphabet[1] && domain != Alphabet[2] && domain != Alphabet[4]) return !0;
    return !1;
  };
  canTrack() && console.info(`[${Alphabet[7]}] 已启用使用情况跟踪，如需关闭请修改 window.enableTrack (类型：布尔)`);

  //requestAnimationFrame
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = callback => {
      let currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = setTimeout(() => {
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
    return window.getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
  };

  let rootText = "";
  if (!getRoot("alertTheme")) rootText += `/*alert背景*/--alertTheme:${Alphabet[6]};`;
  if (!getRoot("alertBg")) rootText += `/*alert遮罩*/--alertBg:${Alphabet[6]};`;
  if (!getRoot("alertFontSize")) rootText += "/*alert字体大小*/--alertFontSize:1rem;";
  if (!getRoot("alertColor")) rootText += "/*alert字体颜色*/--alertColor:#000;";

  if (!getRoot("confirmTheme")) rootText += `/*confirm背景*/--confirmTheme:${Alphabet[6]};`;
  if (!getRoot("confirmBg")) rootText += `/*confirm遮罩*/--confirmBg:${Alphabet[6]};`;
  if (!getRoot("confirmBtnBg")) rootText += "/*confirm按钮背景*/--confirmBtnBg:#b6c781;";
  if (!getRoot("confirmFontSize")) rootText += "/*confirm字体大小*/--confirmFontSize:1rem;";
  if (!getRoot("confirmColor")) rootText += "/*confirm字体颜色*/--confirmColor:#000;";
  if (!getRoot("confirmBtnColor")) rootText += "/*confirm按钮字体颜色*/--confirmBtnColor:#fff;";

  const style = document.createElement("style");
  style.innerHTML = `:root{${rootText}}`;
  document.querySelector("head").appendChild(style);

  //是否已经显示遮罩
  let isMaskShow = !1;
  const setMaskCSS = (mask, maskBg) => {
    mask.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  width: 100%;
  height: 100%;
  display:flex;
  justify-content:center;
  background: ${Alphabet[6]};
  background: ${maskBg};`;
  };

  const setPlanCSS = (plan, maskBg) => {
    plan.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;`;

    if (maskBg) plan.style.cssText += `background:rgba(255, 255, 255, 0.66);`;
  };
  //修改原生alert
  window.alert = content => {
    let timeout,
      mask = document.createElement(`div`),
      maskBg = !isMaskShow ? getRoot(`alertBg`) : null,
      div = document.createElement(`div`),
      msg = document.createElement(`p`),
      blur = document.createElement(`div`),
      plan = document.createElement(`div`),
      Theme = getRoot(`alertTheme`),
      fontSize = getRoot(`alertFontSize`),
      color = getRoot(`alertColor`);

    setMaskCSS(mask, maskBg);
    mask.style.cssText += `align-items: flex-end;`;
    div.style.cssText = `
      background: ${Alphabet[6]};
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
      background: ${Alphabet[6]};
      filter: blur(10px) saturate(2);`;
    setPlanCSS(plan);

    msg.innerText = content ? content.toString() : "";
    div.appendChild(blur);
    div.appendChild(plan);
    div.appendChild(msg);
    mask.appendChild(div);
    document.body.appendChild(mask);

    mask.onclick = () => {
      clearTimeout(timeout);
      document.body.removeChild(mask);
      mask = div = timeout = color = null;
    };

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      div.style.opacity = "0";
      div.addEventListener("transitionend", () => {
        document.body.removeChild(mask);
        mask = div = timeout = color = null;
      });
    }, 800);
  };
  //修改原生confirm
  window.confirm = config => {
    let content,
      confirmText,
      cancelText,
      success,
      fail,
      mask = document.createElement(`div`),
      div = document.createElement(`div`),
      blur = document.createElement(`div`),
      plan = document.createElement(`div`),
      msg = document.createElement(`p`),
      confirm = document.createElement(`button`),
      cancel = document.createElement(`button`),
      maskBg = !isMaskShow ? getRoot(`confirmBg`) : null,
      btnBg = getRoot(`confirmBtnBg`),
      Theme = getRoot(`confirmTheme`),
      fontSize = getRoot(`confirmFontSize`),
      color = getRoot(`confirmColor`),
      btnColor = getRoot(`confirmBtnColor`);
    const showConfirm = config.showConfirm == undefined ? true : config.showConfirm,
      showCancel = config.showCancel == undefined ? true : config.showCancel;

    setMaskCSS(mask, maskBg);
    mask.style.cssText += "align-items: center;";
    div.style.cssText = `
      background: ${Alphabet[6]};
      background:${Theme};
      text-align: center;
      color: ${color};
      font-size: ${fontSize};
      padding: 1.5em;
      max-width:75vw;
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
      background: ${Alphabet[6]};
      filter: blur(10px) saturate(2);`;
    setPlanCSS(plan);

    msg.style.cssText = `margin:0;position: relative;line-height: 2;`;
    const buttonCSS = `position: relative;margin: 2.5em 1em 0 1em;font-size: .8em;appearance: none;background: ${btnBg};color: ${btnColor};border: none;padding: 1em 3em;cursor: pointer;outline: none;`;
    confirm.style.cssText = cancel.style.cssText = buttonCSS;

    const removeConfirm = () => {
      document.body.removeChild(mask);
      isMaskShow = !1;
    };

    const createModel = () => {
      msg.innerText = content ? content.toString() : "";
      div.appendChild(blur);
      div.appendChild(plan);
      div.appendChild(msg);
      if (showConfirm) confirm.innerText = confirmText ? confirmText.toString() : "确认";
      if (showCancel) cancel.innerText = cancelText ? cancelText.toString() : "取消";

      showConfirm && div.appendChild(confirm);
      showCancel && div.appendChild(cancel);

      mask.appendChild(div);
      document.body.appendChild(mask);
      isMaskShow = !0;
    };

    if (typeof config == "string") {
      content = config;
      createModel();
    } else {
      content = config.content;
      confirmText = config.confirmText;
      cancelText = config.cancelText;
      success = config.success;
      fail = config.fail;
      createModel();
    }

    return new Promise((ok, no) => {
      if (showConfirm)
        confirm.onclick = () => {
          removeConfirm();
          success ? success() : ok();
        };
      if (showCancel)
        cancel.onclick = () => {
          removeConfirm();
          fail ? fail() : no();
        };
    });
  };
  //loading遮罩
  const LoadingName = "Pd_loader";
  window.showLoading = () => {
    const mask = document.createElement("div"),
      svg = new Image();

    svg.src = icoConfig.load;
    mask.id = `${LoadingName}`;
    mask.style.cssText = "width:100%;height:100%;position: fixed;z-index: 99;top: 0;left: 0;background:rgba(0,0,0,.65);display:flex;align-items: center; justify-content: center;";

    document.querySelector(`#${LoadingName}`) && document.body.removeChild(document.querySelector(`#${LoadingName}`));
    mask.appendChild(svg);
    document.body.appendChild(mask);
  };
  window.hideLoading = () => {
    document.querySelector(`#${LoadingName}`) && document.body.removeChild(document.querySelector(`#${LoadingName}`));
  };

  //内置方法
  const PandoraAPI = class {
    constructor(element = "html") {
      this.element = element;
      this.getEle = ele => {
        const typeArr = ["[object Window]", "[object HTMLDocument]"];
        if (typeArr.includes(ele + "")) return window;

        if (document.querySelectorAll(ele)) {
          if (document.querySelectorAll(ele).length > 1) {
            return document.querySelectorAll(ele);
          } else {
            return document.querySelector(ele);
          }
        } else {
          return console.error(`[${Alphabet[8]}] 没有找到名称为 ${this.element} 的元素`);
        }
      };
      this.init = () => this.getEle(element);
      this.get = this.init();
      this.guid = () => {
        const S4 = () => {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return `PandoraAPI_${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
      };
      //生产PandoraId
      this.pid = this.guid();
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
        try {
          this.get = this.getEle(element)[index];
        } catch (err) {
          console.error(`[${Alphabet[8]}] 没有找到该下标\n${err}`);
        }
        return this;
      };
      //选择子级元素
      this.child = name => {
        const ele = this.get;
        try {
          this.get = ele.querySelectorAll(name);
        } catch (err) {
          console.error(`[${Alphabet[8]}] 没有找到该子级\n${err}`);
        }
        return this;
      };
      //选择父级
      this.parent = () => {
        const ele = this.get;
        try {
          this.get = ele.parentElement;
        } catch (err) {
          console.error(`[${Alphabet[8]}] 没有找到该父级\n${err}`);
        }
        return this;
      };
      //选择其他同级元素
      this.siblings = name => {
        const ele = this.get,
          parent = this.parent();
        let siblingArr = [];

        for (let e of parent.child(name).get) {
          if (ele != e) siblingArr.push(e);
        }
        this.get = siblingArr;
        return this;
      };
      //选择上一个同级元素
      this.prev = () => {
        const ele = this.get;
        this.get = ele.previousElementSibling;
        return this;
      };
      //选择下一个同级元素
      this.next = () => {
        const ele = this.get;
        this.get = ele.nextElementSibling;
        return this;
      };
      //遍历元素集
      this.each = fn => {
        const ele = this.get;
        for (let i = 0; i < ele.length; i++) fn && fn(this.eq(i), i);
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
        if (str != undefined) {
          ele.innerText = str.toString();
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
        if (value != null && value != undefined) {
          ele.value = value;
        }
        return ele.value;
      };
      //插入元素
      this.prepend = target => {
        const ele = this.get;
        if (ele.length) {
          for (let e of ele) e.innerHTML = `${target}${e.innerHTML}`;
        } else {
          ele.innerHTML = `${target}${ele.innerHTML}`;
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
        try {
          ele.parentElement.removeChild(ele);
        } catch (err) {
          console.error(`[${Alphabet[8]}] 没有找到可以移除的元素\n${err}`);
        }
        return this;
      };
      //添加class
      this.addClass = name => {
        const ele = this.get,
          addThat = ele => {
            const beforeClass = ele.classList.value;
            if (beforeClass) {
              if (beforeClass.indexOf(name) < 0) ele.className = `${beforeClass} ${name.trim()}`;
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
      //移除class
      this.removeClass = name => {
        const ele = this,
          removeThat = ele => {
            let beforeClass = ele.classList.value.split(" "),
              afterClass;
            beforeClass.map((cur, idx) => {
              if (cur === name) beforeClass.splice(idx, 1);
            });
            afterClass = beforeClass.join(" ");
            ele.className = afterClass;
          };

        if (ele.length) {
          for (let e of ele.get) removeThat(e);
        } else {
          removeThat(ele.get);
        }
        return this;
      };
      //是否拥有class名
      this.hasClass = name => {
        const ele = this.get,
          classlist = ele.classList.value.indexOf(" ") > -1 ? ele.classList.value.split(" ") : ele.classList.value;
        if (classlist.indexOf(name) > -1) {
          return !0;
        } else {
          return !1;
        }
      };
      //添加属性
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
      //移除属性
      this.removeAttr = name => {
        const ele = this.get;
        ele.removeAttribute(name);
        return this;
      };
      //绑定事件
      this.bind = (eventName, fn, bool = !1) => {
        const ele = this.get;
        if (ele.length) {
          ele.forEach(the => {
            the.addEventListener(eventName, fn, bool);
            the.eventList = [];
            the.eventList.push({ name: eventName, callback: fn });
          });
        } else {
          ele.addEventListener(eventName, fn, bool);
          ele.eventList = [];
          ele.eventList.push({ name: eventName, callback: fn });
        }
        return this;
      };
      //解绑事件
      this.unbind = eventName => {
        const ele = this.get;
        if (ele.length) {
          ele.forEach(the => {
            the.eventList.map((e, i) => {
              if (e.name === eventName) {
                the.removeEventListener(eventName, e.callback);
                the.eventList.splice(i, 1);
              }
            });
          });
        } else {
          ele.eventList.map((e, i) => {
            if (e.name === eventName) {
              ele.removeEventListener(eventName, e.callback);
              ele.eventList.splice(i, 1);
            }
          });
        }
        return this;
      };
      //点击事件
      this.click = fn => {
        this.bind("click", fn);
        return this;
      };
      //长按事件
      this.taping = fn => {
        const ele = this.get;
        let infiniteFrame;
        try {
          window.ontouchstart;
        } catch (err) {
          ele.onclick = fn;
          return this;
        }
        const infiniteFn = () => {
          fn();
          infiniteFrame = requestAnimationFrame(infiniteFn);
        };
        ele.ontouchstart = event => {
          event.preventDefault();
          cancelAnimationFrame(infiniteFn);
          infiniteFn();
        };
        ele.ontouchend = () => {
          cancelAnimationFrame(infiniteFrame);
          return this;
        };
      };
      //过渡结束事件
      this.transitionEnd = fn => {
        try {
          window.ontransitionend;
          this.bind("transitionend", fn);
        } catch (err) {
          console.error(`[${Alphabet[8]}] 不支持ontransitionend事件\n${err}`);
          return !1;
        }
        return this;
      };
      //动画结束事件
      this.animationEnd = fn => {
        try {
          window.onanimationend;
          this.bind("animationend", fn);
        } catch (err) {
          console.error(`[${Alphabet[8]}] 不支持animationend事件\n${err}`);
          return !1;
        }
        return this;
      };
      //显示
      this.show = callback => {
        this.attr(`beforeHide`) ? this.css({ display: this.attr(`beforeHide`) }) : this.css({ display: "block" });
        callback && setTimeout(callback);
        return this;
      };
      //隐藏
      this.hide = callback => {
        if (this.get.length) {
          for (let a of this.get) this.get = a;
        }
        if (!this.attr(`beforeHide`)) this.attr("beforeHide", this.css(`display`) == "none" ? "block" : this.css(`display`));
        this.css({ display: "none" });
        callback && setTimeout(callback);
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
          //设置请求头(类型：对象)
          headers: { "Content-type": "application/x-www-form-urlencoded" },
          //发送数据类型(类型：字符串；可选参数：json、form)
          dataType: "json",
          //发送数据(类型：json或form；格式必须和发送数据类型保持一致)
          data: null,
          //成功回调方法(类型：方法；返回类型：对象)
          success: null,
          //失败回调方法(类型：方法)
          error: null,
          // 加载中回调方法(类型：方法)
          progress: null,
        };
        config = this.extend(config, options);
        const http = new XMLHttpRequest(),
          { url, type, async, headers, dataType, data, success, error, progress } = config;
        let params;
        if (dataType == "json") {
          if (data)
            params = Object.keys(data)
              .map(key => {
                return `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
              })
              .join(`&`);
        } else {
          params = data;
        }

        http.onload = () => {
          if (http.status === 200 || http.statusText === "OK" || http.readyState === 4) {
            const res = http.response;
            try {
              JSON.parse(res);
            } catch (err) {
              success && success(res);
              return !1;
            }
            success && success(JSON.parse(res));
          } else {
            error && error();
          }
        };

        http.onerror = error;
        http.open(type.toUpperCase(), url, async);
        http.upload.onprogress = event => {
          if (event.lengthComputable) {
            progress && progress(Math.floor((event.loaded / event.total) * 100));
          }
        };

        for (let keys in headers) http.setRequestHeader(keys, headers[keys]);
        http.send(params);
      };
      //fetch
      this.fetch = options => {
        let config = {
          //接口地址(类型：字符串)
          url: null,
          //设置请求头(类型：对象)
          headers: { "Content-type": "application/x-www-form-urlencoded" },
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
        const { url, data, headers, type, success, error } = config;

        fetch(url, { body: data, headers, method: type.toLocaleUpperCase() })
          .then(res => {
            if (res.ok) {
              return res.json();
            } else {
              console.error(`[${Alphabet[8]}] 请求地址发生错误！\n${res}`);
            }
          })
          .then(res => {
            success && success(res);
          })
          .catch(res => {
            error && error(res);
          });
      };
      //表单序列化
      this.serialize = () => {
        const ele = this.get;
        let obj = {};
        for (let e of ele.querySelectorAll(`*`)) {
          if (e.getAttribute(`name`)) {
            const keyName = e.getAttribute(`name`);
            if (keyName) obj[keyName] = e.value;
          }
        }
        return obj;
      };
      //使用追踪
      this.usingTrack = fnName => {
        const form = navigator.userAgent,
          domain = window.location.href;
        canTrack() && this.fetch({ url: `https://api.${Alphabet[3]}/Pd_track?usageFunction=${fnName}&usagePlatform=${form}&usageDomain=${domain}` });
      };
      //全局变量
      this.globalData = {};
      //设置全局变量
      this.setData = obj => {
        return new Promise((success, fail) => {
          for (let key in obj) {
            try {
              this.globalData[key] = obj[key];
            } catch (err) {
              console.error(`[${Alphabet[8]}] 动态变量修改失败！${err}`);
              fail(err);
            }
          }
          success();
        });
      };
      //模板渲染
      this.template = (route, container) => {
        return new Promise((success, fail) => {
          const temp = (() => {
            let cur;
            const template = document.querySelectorAll(`template`);
            for (let a = 0; a < template.length; a++) {
              if (template[a].getAttribute(`route`) == route) cur = template[a];
            }
            return cur;
          })();

          if (temp) {
            this.empty();
            container.appendChild(document.importNode(temp.content, !0));
            success();
          } else {
            console.error(`[${Alphabet[8]}] 不存在以下路由模板：${route}`);
            fail(`${route}`);
          }
        });
      };
      //获取url参数并转换成对象
      this.getParams = () => {
        const url = location.href.split(`?`);
        if (location.href.indexOf(`?`) > -1) {
          let obj = {};
          if (url[1].split(`&`)) {
            const params = url[1].split(`&`);
            params.map(v => {
              obj[v.split(`=`)[0]] = v.split(`=`)[1];
            });
          } else {
            obj[url[1].split(`=`)[0]] = obj[url[1].split(`=`)[1]];
          }
          return obj;
        } else {
          return null;
        }
      };
      // HASH改变
      this.hashChange = callback => {
        const getRoutePath = () => {
          if (location.hash.indexOf(`#`) > -1) {
            return location.hash.match(/#(\S*)\?/) == null ? location.hash.match(/#(\S*)/)[1] : location.hash.match(/#(\S*)\?/)[1];
          } else {
            return !1;
          }
        };
        const routePath = getRoutePath() || "/";
        callback(routePath);
      };
    }
  };
  //拓展方法
  const PandoraJs = SuperClass => {
    return class extends SuperClass {
      constructor(element) {
        super(element);
      }
      //Mustache渲染
      Mush(options) {
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
        const that = this,
          { data, Init, Update } = config;

        // 重构渲染数据
        const getObj = res => {
          let newObj = {};
          for (let keyName of Object.keys(res)) newObj[keyName] = res[keyName];
          return newObj;
        };

        // 获取所有MUSH变量
        const getMush = () => {
          let r = [];
          Html.match(pattern).forEach((e, index) => {
            r[index] = e.split(`{{`)[1].split(`}}`)[0];
          });
          return r;
        };
        matchValue = getMush();

        //渲染html
        const renderHtml = () => {
          return new Promise(next => {
            Html = bHtml;
            for (let value of matchValue) {
              for (let keyName in data) value === keyName && (Html = Html.replace(patterns, data[value].toString() || ""));
            }
            that.html(Html);
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
          Object.defineProperty(that.globalData, e, {
            set(value) {
              data[e] = value;
              renderHtml();
              Update && Update(getObj(that.globalData));
            },
            get() {
              return data[e];
            },
            enumerable: !0,
          });
        });

        renderHtml();
        Init && Init(getObj(that.globalData));
        return this;
      }
      //静态路由
      Router(options) {
        let config = {
          // 路由路径集合(类型：数组)
          routes: null,
        };
        config = this.extend(config, options);
        const that = this,
          { routes } = config;
        templatePolyfill();

        // 遍历路由路径
        const eachRoutes = path => {
          return new Promise((success, fail) => {
            if (path) {
              if (JSON.stringify(routes).indexOf(path) < 0) {
                fail(`[${Alphabet[8]} - Router] ${path} 不存在于routes！`);
              } else {
                routes.forEach(e => {
                  if (path == e.path) {
                    that
                      .template(path, that.get)
                      .then(() => {
                        let query = that.getParams();
                        window.location.href = `#${path}`;
                        e.callback && e.callback(query);
                        success();
                        window.onhashchange = null;
                        setTimeout(() => {
                          window.onhashchange = () => {
                            that.hashChange(eachRoutes);
                          };
                        });
                      })
                      .catch(err => {
                        e.error && e.error(err);
                      });
                  }
                });
              }
            }
          });
        };

        // 路由导航
        this.navigateTo = path => {
          if (path.indexOf(`?`) > -1) {
            setTimeout(() => {
              location.href = `#${path}`;
            });
          } else {
            eachRoutes(path);
          }
        };

        if (routes) {
          eachRoutes(routes[0].path);
        } else {
          console.error(`[${Alphabet[8]} - Router] 不存在任何routes！`);
        }
        return this;
      }
      //轮播切换
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
        config = this.extend(config, options);
        const { Speed, Curve, Effect, Direction, Inertia, Distance, AutoSpeed, Pagination, Hover, Scroll, InitPage, Loop, onChange } = config,
          childEle = this.get,
          parentEle = childEle[0].parentElement;
        let childW = childEle[0].offsetWidth,
          childH = childEle[0].offsetHeight,
          cur = InitPage,
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
          Pager(cur);
          onChange && onChange(cur);
          switch (Effect) {
            case "fade":
              for (let cur of childEle) cur.style.opacity = 0;
              childEle[cur].style.opacity = 1;
              break;
            default:
              switch (Direction) {
                case "vertical":
                  childH = childEle[0].offsetHeight;
                  parentEle.style.transform = `translate3d(0,${-1 * (childH * cur)}px,0)`;
                  break;
                case "horizontal":
                default:
                  childW = childEle[0].offsetWidth;
                  parentEle.style.transform = `translate3d(${-1 * (childW * cur)}px,0,0)`;
                  break;
              }
              break;
          }
          if (Loop) {
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
        const Pager = current => {
          for (let e of childEle) e.className = e.className.replace(Alphabet[0], "").trim();
          if (childEle[cur].className) {
            childEle[cur].className += ` ${Alphabet[0]}`;
          } else {
            childEle[cur].className += Alphabet[0];
          }
          if (Pagination) {
            if (parentEle.parentElement.querySelector(`.Pd-pagination`)) {
              parentEle.parentElement.removeChild(parentEle.parentElement.querySelector(`.Pd-pagination`));
            }
            const pager = document.createElement("div");
            pager.className = "Pd-pagination";

            for (let a = 0; a < total; a++) {
              const pageChild = document.createElement("a"),
                textNode = childEle[a].getAttribute(`data-title`) ? document.createTextNode(childEle[a].getAttribute(`data-title`)) : document.createTextNode(a);
              pageChild.setAttribute("href", "javascript:void 0");
              if (a === current) pageChild.className = Alphabet[0];
              pageChild.appendChild(textNode);
              pager.appendChild(pageChild);
            }
            parentEle.parentElement.insertBefore(pager, parentEle.nextElementSibling);
            for (let a = 0; a < parentEle.parentElement.querySelectorAll(`.Pd-pagination a`).length; a++) {
              const e = parentEle.parentElement.querySelectorAll(`.Pd-pagination a`)[a],
                idx = a;
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
          } else if (cur === 0 && Loop) {
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
          } else if (cur === total - 1 && Loop) {
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
          if (event.target.getAttribute(`switch-cancel`) || event.target.tagName.toUpperCase() == "A") return !1;
          clearTimeout(AutoTimeout);
          cancelAnimationFrame(AutoPlayFrame);
          const { pageX, pageY } = event.changedTouches[0];
          const { left, top } = parentEle.parentElement.getBoundingClientRect();

          switch (config.Direction) {
            case "vertical":
              startY = pageY - top;
              break;
            case "horizontal":
            default:
              startX = pageX - left;
              break;
          }
          parentEle.style.transition = null;
        };

        //方法：滑动中
        const touchMove = event => {
          if (event.target.getAttribute(`switch-cancel`) || event.target.tagName.toUpperCase() == "A") return !1;
          const { pageX, pageY } = event.changedTouches[0],
            { left, top } = parentEle.parentElement.getBoundingClientRect();
          curX = pageX - left;
          curY = pageY - top;

          switch (Effect) {
            case "fade":
              for (let cur of childEle) cur.style.transition = `opacity ${Speed}s linear`;
              break;
            default:
              switch (Direction) {
                case "vertical":
                  if (startY > curY) {
                    if (cur != total - 1) parentEle.style.transform = `translate3d(0,${-1 * (startY - curY + childH * cur)}px,0)`;
                  } else {
                    if (cur != 0) parentEle.style.transform = `translate3d(0,${-1 * (childH * cur) + Math.abs(curY - startY)}px,0)`;
                  }
                  break;
                case "horizontal":
                default:
                  if (startX > curX) {
                    parentEle.style.transform = `translate3d(${-1 * (startX - curX + childW * cur)}px,0,0)`;
                  } else {
                    parentEle.style.transform = `translate3d(${-1 * (childW * cur) + Math.abs(curX - startX)}px,0,0)`;
                  }
                  break;
              }
              break;
          }
        };

        //方法：滑动结束
        const touchEnd = event => {
          if (event.target.getAttribute(`switch-cancel`) || event.target.tagName.toUpperCase() == "A") return !1;
          clearTimeout(AutoTimeout);
          AutoPlay();
          parentEle.style.transition = `transform ${Speed}s ${Curve}`;
          const { pageX, pageY } = event.changedTouches[0],
            { left, top } = parentEle.parentElement.getBoundingClientRect();

          switch (Direction) {
            case "vertical":
              endY = pageY - top;
              switch (Effect) {
                case "fade":
                  if (startY - endY > childH / config.Distance && cur === total - 1) {
                    cur = 0;
                  } else if (startY - endY > childH / config.Distance && cur < total - 1) {
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
                  if (startY - endY > childH / config.Distance && cur < total - 1) Next();
                  if (endY - startY > childH / config.Distance) Prev();
                  parentEle.style.transform = `translate3d(0,${-1 * (childH * cur)}px,0)`;
                  break;
              }
              break;
            case "horizontal":
            default:
              endX = pageX - left;
              switch (Effect) {
                case "fade":
                  if (startX - endX > childW / Distance && cur === total - 1) {
                    cur = 0;
                  } else if (startX - endX > childW / Distance && cur < total - 1) {
                    Next();
                  } else if (endX - startX > childW / Distance) {
                    Prev();
                  }
                  for (let cur of childEle) {
                    cur.style.transition = `opacity ${Speed}s ${Curve}`;
                    cur.style.opacity = 0;
                  }
                  childEle[cur].style.opacity = 1;
                  Swiper();
                  break;
                default:
                  if (startX - endX > childW / Distance && cur < total - 1) Next();
                  if (endX - startX > childW / Distance) Prev();
                  parentEle.style.transform = `translate3d(${-1 * (childW * cur)}px,0,0)`;
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
          if (AutoSpeed > 0) {
            AutoTimeout = setTimeout(() => {
              Next();
              clearTimeout(AutoTimeout);
              AutoPlayFrame = requestAnimationFrame(AutoPlay);
            }, AutoSpeed * 1000);
          }
        };

        //初始化
        const Init = () => {
          const { offsetWidth, offsetHeight } = childEle[0];
          cur = InitPage;

          new Promise(next => {
            switch (Effect) {
              case "fade":
                for (let cur of childEle) {
                  cur.style.transition = `opacity ${Speed}s ${Curve}`;
                  cur.style.position = "absolute";
                }
                break;
              default:
                switch (Direction) {
                  case "vertical":
                    parentEle.style.width = `${offsetWidth}px`;
                    parentEle.style.height = `${offsetHeight * total}px`;
                    parentEle.style.flexDirection = "column";
                    break;
                  case "horizontal":
                  default:
                    parentEle.style.width = `${offsetWidth * total}px`;
                    parentEle.style.height = `${offsetHeight}px`;
                    parentEle.style.flexDirection = "row";
                    break;
                }
                parentEle.style.cssText += "touch-action: pan-x;touch-action: pan-y";
                parentEle.style.display = "flex";
                parentEle.style.transition = `transform ${Speed}s ${Curve}`;
                break;
            }
            next();
          })
            .then(() => {
              return new Promise(next => {
                //移除事件
                Swiper(InitPage);
                AutoPlay();
                Inertia && parentEle.removeEventListener("touchmove", touchMove);
                Scroll && parentEle.removeEventListener("mousewheel", scrollMove);
                parentEle.removeEventListener("touchstart", touchStart);
                parentEle.removeEventListener("touchend", touchEnd);
                next();
              });
            })
            .then(() => {
              //添加事件
              Inertia && parentEle.addEventListener("touchmove", touchMove);
              Scroll && parentEle.addEventListener("mousewheel", scrollMove);
              parentEle.addEventListener("touchstart", touchStart);
              parentEle.addEventListener("touchend", touchEnd);
              if (Hover) {
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
          clearTimeout(req);
          req = setTimeout(Init, 200);
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
        const meta = document.createElement(`meta`),
          { PageSize, InitScale, MinScale, MaxScale, Ratio } = config;
        meta.setAttribute("name", "viewport");
        if (typeof PageSize !== "number") {
          meta.setAttribute("content", `width=${PageSize},initial-scale=${InitScale},minimum-scale=${MinScale},maximum-scale=${MaxScale},user-scalable=no,viewport-fit=cover`);
        } else {
          meta.setAttribute("content", `width=${PageSize},user-scalable=no,viewport-fit=cover`);
        }
        new PandoraAPI(`head`).get.appendChild(meta);

        const SetSize = () => {
          const platform = navigator.userAgent.toLowerCase(),
            deviceList = ["iphone", "android"];
          let isMobile = !1;

          deviceList.forEach(c => {
            if (isMobile) return !1;
            if (platform.indexOf(c) > 0 && PageSize !== "device-width") {
              isMobile = !0;
              this.css({ "font-size": `${(window.screen.width / 3.75) * Ratio}px` });
            } else {
              isMobile = !1;
              this.css({ "font-size": this.css(`font-size`) });
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
        const masker = document.createElement(`div`),
          parent = this.get.parentElement,
          { mask, maskColor, maskOut, Speed, Curve, Direction, In, Out, Confirm, Cancel } = config;
        masker.className = "Pd-Mask";
        const confirmBtn = Confirm.btn ? new PandoraAPI(Confirm.btn) : null,
          cancelBtn = Cancel.btn ? new PandoraAPI(Cancel.btn) : null;

        if (Direction !== "none") this.css({ transition: `all ${Speed}ms ${Curve}` });

        //关闭弹框
        const closeDialog = () => {
          return new Promise(next => {
            Effect(`out`);
            if (Direction === "none") {
              mask && parent.removeChild(masker);
              this.css({ display: "none" });
              next();
            } else {
              this.bind("transitionend", () => {
                mask && parent.removeChild(masker);
                this.css({ display: "none" });
                this.unbind("transitionend");
                next();
              });
            }
            Confirm.btn && confirmBtn.unbind(`click`);
            Cancel.btn && cancelBtn.unbind(`click`);
            window.onresize = null;
          });
        };

        //进入和退出效果
        const Effect = where => {
          if (mask) {
            parent.insertBefore(masker, this.get.nextElementSibling);
            new PandoraAPI(`.Pd-Mask`).css({ width: "100vw", height: "100vh", background: maskColor, position: "fixed", top: 0, left: 0, "z-index": 998 });
          }

          switch (where) {
            case "in":
              this.css({ display: "block" });
              switch (Direction) {
                case "top":
                  this.css({ transform: "translate3d(0,-100%,0)" });
                  break;
                case "bottom":
                  this.css({ transform: "translate3d(0,100%,0)" });
                  break;
                case "zoom":
                default:
                  this.css({ transform: "translate3d(0,0,0) scale(0)" });
                  break;
              }
              In && In();
              break;
            case "out":
              switch (Direction) {
                case "none":
                  this.css({ display: "none" });
                  break;
                case "top":
                  this.css({ transform: "translate3d(0,-100%,0)" });
                  break;
                case "bottom":
                  this.css({ transform: "translate3d(0,100%,0)" });
                  break;
                case "zoom":
                default:
                  this.css({ transform: "translate3d(0,0,0) scale(0)" });
                  break;
              }
              Out && Out();
              break;
          }
        };

        const openDialog = param => {
          new Promise(next => {
            Effect(`in`);
            next();
          })
            .then(() => {
              return new Promise(next => {
                const calcDialog = () => {
                  const top = parseInt(this.css(`height`)) / 2,
                    left = parseInt(this.css(`width`)) / 2;
                  switch (Direction) {
                    case "none":
                      this.css({ position: "fixed", top: `calc(50% - ${top}px)`, left: `calc(50% - ${left}px)`, "z-index": 999 });
                      break;
                    case "top":
                      this.css({ position: "fixed", top: 0, left: `calc(50% - ${left}px)`, "z-index": 999, transform: "translate3d(0,0,0) scale(1)" });
                      break;
                    case "bottom":
                      this.css({ position: "fixed", bottom: 0, left: `calc(50% - ${left}px)`, "z-index": 999, transform: "translate3d(0,0,0) scale(1)" });
                      break;
                    case "zoom":
                    default:
                      this.css({ position: "fixed", top: `calc(50% - ${top}px)`, left: `calc(50% - ${left}px)`, "z-index": 999, transform: "translate3d(0,0,0) scale(1)" });
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
              if (mask && maskOut) masker.onclick = closeDialog;
              const { close } = this;
              //确认按钮被点击
              Confirm.btn &&
                confirmBtn.bind("click", () => {
                  Confirm.callback({ param: param || null, close });
                });
              //取消按钮被点击
              Cancel.btn &&
                cancelBtn.bind("click", () => {
                  Cancel.callback({ param: param || null, close });
                });
            });
        };

        this.close = closeDialog;
        this.open = openDialog;
        return this;
      }
      //图片预加载
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
          error() {
            console.error(`[${Alphabet[8]} - ImgLoader] 图片资源加载错误`);
            alert("图片资源加载错误");
          },
        };
        config = this.extend(config, options);
        const pattern = new RegExp('".*?"', "g"),
          pattern2 = new RegExp(/'.*?'/, "g"),
          pattern3 = new RegExp(/\(.*?\)/, "g"),
          { lazy, loading, callback, error } = config;
        let ImgArr = [],
          total = 0,
          cur = 0,
          step = 0,
          floatNum = 0;

        for (let e of this.getEle("*")) {
          if (e.nodeName.toLowerCase() == "img") e.src && ImgArr.push(e.src);
          const getBg = window.getComputedStyle(e).getPropertyValue(`background-image`);
          if (getBg.indexOf(`url`) > -1 && getBg != "none" && getBg.indexOf(`data:`) < 0 && getBg.indexOf(`blob:`) < 0) {
            const url1 = getBg.match(pattern),
              url2 = getBg.match(pattern2),
              url3 = getBg.match(pattern3);

            if (url1) ImgArr.push(url1[0].toString().replace(/"/g, ""));
            if (url2) ImgArr.push(url2[0].toString().replace(/'/g, ""));
            if (url3) {
              let src = url3[0].toString().replace(/\(/, "").replace(/\)/, "");
              if (src.match(pattern)) src = src.match(pattern)[0].toString().replace(/"/g, "");
              if (src.match(pattern2)) src = src.match(pattern2)[0].toString().replace(/'/g, "");
              ImgArr.push(src);
            }
          }
        }
        total = ImgArr.length;

        const loader = src => {
          return new Promise((success, fail) => {
            const img = new Image();
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
          error();
        });

        const loadStep = () => {
          step = (cur / total) * 100;
          if (floatNum < 100) {
            if (floatNum < step) lazy ? floatNum++ : (floatNum = step);
            this.attr("Pd-load", floatNum);
            loading && loading(floatNum);
            if (floatNum === 100) {
              cancelAnimationFrame(loadStepFrame);
              if (lazy) {
                callback && callback();
              } else {
                setTimeout(callback);
              }
            } else {
              loadStepFrame = requestAnimationFrame(loadStep);
            }
          }
        };
        loadStep();
        return this;
      }
      //图片上传
      ImgUpload(options) {
        let config = {
          //接口地址(类型：字符串)
          apiUrl: `https://api.${Alphabet[3]}/Pd_uploadImage`,
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
            //上传中(类型：方法；返回类型：数字)
            progress: null,
            //上传成功(类型：方法；返回类型：对象)
            success: null,
            //失败(类型：方法)
            fail() {
              console.error(`[${Alphabet[8]} - ImgUpload] 图片上传失败！`);
            },
          },
          //唯一id(类型：字符串；如果为null，则启用临时上传，请谨慎使用)
          Uid: null,
        };
        config = this.extend(config, options);
        const that = this,
          innerHtml = this.html(),
          { apiUrl, Format, type, Max, Quality, Clip, alwaysCover, Events, Uid } = config;
        this.empty();
        this.get.insertAdjacentHTML("afterbegin", `<label for="Pd_imgUpload_${this.pid}" style="width:100%;height:100%;display:block;"></label>`);

        let uploadBtn = document.createElement(`input`),
          userId,
          total = Max,
          current = 0,
          steps = (current / total) * 100;

        if (Uid) {
          userId = Uid;
        } else {
          userId = `${document.domain}_${this.pid}`;
        }

        uploadBtn.type = "file";
        uploadBtn.accept = `image/${Format}`;
        uploadBtn.id = `Pd_imgUpload_${this.pid}`;
        uploadBtn.setAttribute("capture", type);
        uploadBtn.style.display = "none";

        if (Max > 1) uploadBtn.multiple = !0;
        const label = this.get.querySelector(`label`);
        label.innerHTML = innerHtml;
        label.append(uploadBtn);

        //上传图片
        const uploadPreview = obj => {
          const formData = new FormData();
          let waitUploadFile = obj;
          if (alwaysCover) waitUploadFile = new File([obj], `cover.${obj.name.split(".")[1]}`, { type: obj.type });
          formData.append("images", waitUploadFile);
          formData.append("uid", userId);
          formData.append("width", Clip.width);
          formData.append("height", Clip.height);
          formData.append("quality", Quality);

          if (Events.ready) {
            Events.ready();
          } else {
            !Events.ready && window.showLoading();
          }

          this.ajax({
            url: `${apiUrl}`,
            async: !0,
            type: "post",
            dataType: "form",
            headers: null,
            data: formData,
            progress: Events.progress,
            success(res) {
              that.usingTrack(`ImgUpload`);
              if (res) {
                current++;
                steps = (current / total) * 100;
                uploadBtn.setAttribute("data-progress", steps);
                if (steps === 100) {
                  const data = { src: res.images };

                  uploadBtn.disabled = !1;
                  uploadBtn.value = "";
                  !Events.ready && window.hideLoading();
                  Events.success && Events.success(data);
                }
              } else {
                alert("发生错误！");
                console.error(`[${Alphabet[8]} - ImgUpload] 服务端错误！`);
              }
            },
            error() {
              uploadBtn.disabled = !1;
              uploadBtn.value = "";
              !Events.ready && window.hideLoading();
              Events.fail && Events.fail();
            },
          });
        };

        //获取选择文件
        const selectedFile = Files => {
          const files = Array.prototype.slice.call(Files);
          if (Max === 0 || files.length <= Max) {
            current = 0;
            uploadBtn.disabled = !0;
            total = files.length;

            if (total > 0) {
              files.forEach((file, idx) => {
                uploadPreview(Files[idx]);
              });
            }
          } else {
            Events.overMax && Events.overMax();
            console.info(`[${Alphabet[7]} - ImgUpload] 文件数量超过最大数量:${Max}`);
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
        let that = this.get,
          imgArr = [],
          imgIndex = [],
          btnAnimation = "transition:opacity .2s ease-in",
          topIndex,
          canMove = !0;

        this.parent().css({ position: "relative", "touch-action": "pan" });

        if (JSON.parse(that.getAttribute(`Pd-move`))) {
          imgIndex.push(Number(that.getAttribute(`alt`)));
          imgArr.push(that);
        }

        topIndex = imgArr.length;

        //图标配置
        const iconStyle = option => {
          let positionConfig = { top: null, left: null, right: null, bottom: null, name: null };
          positionConfig = this.extend(positionConfig, option);
          return `<a class="Pd-ImgTransit-btn Pd-${positionConfig.name}" style="width:${config.iconSize}px;height:${config.iconSize}px;background:#fff url('${
            icoConfig[positionConfig.name]
          }');background-position:center;background-repeat:no-repeat;background-size:65%;position:absolute;border-radius:50%;top:${positionConfig.top}px;left:${positionConfig.left}px;right:${positionConfig.right}px;bottom:${
            positionConfig.bottom
          }px;z-index:2;${btnAnimation}" href="javascript:void 0"></a>`;
        };

        const icon = {
          resize: iconStyle({ left: `-${config.iconSize / 2}`, bottom: `-${config.iconSize / 2}`, name: "resize" }),
          rotate: iconStyle({ right: `-${config.iconSize / 2}`, top: `-${config.iconSize / 2}`, name: "rotate" }),
          delete: iconStyle({ left: `-${config.iconSize / 2}`, top: `-${config.iconSize / 2}`, name: "delete" }),
        };

        //删除原始元素
        const deleteDefault = () => {
          const imgRealArr = this.get.querySelectorAll(`img`),
            imgArr = Array.prototype.slice.call(imgRealArr);
          imgArr.forEach((cur, idx) => {
            let current = imgRealArr[idx];
            JSON.parse(current.getAttribute(`Pd-move`)) && current.parentElement.removeChild(current);
          });
        };

        //设置参数
        const setConfig = (ele, eleConfig) => {
          for (let a of ele.querySelectorAll(`.Pd-ImgTransit-btn`)) a.style.transform = `scale(${1 / (eleConfig.scale / 100)}) rotate(${-1 * eleConfig.rotate}deg)`;
          return (ele.style.transform = `translate3d(${eleConfig.translate}) scale(${eleConfig.scale / 100}) rotate(${eleConfig.rotate}deg)`);
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
          const x = p2.pageX - p1.pageX,
            y = p2.pageY - p1.pageY;
          return Math.sqrt(x * x + y * y);
        };

        // 获取两点角度
        const getAngle = (p1, p2) => {
          const x = p1.pageX - p2.pageX,
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
                let scale = getDistance(now[0], now[1]) / getDistance(start[0], start[1]); //得到缩放比例，getDistance是勾股定理的一个方法
                let rotation = getAngle(now[0], now[1]) - getAngle(start[0], start[1]); //得到旋转角度，getAngle是得到夹角的一个方法
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
          startX = 0,
          startY = 0,
          prevScale = 100;

        const addEvent = ele => {
          let eleReal = ele[0].parentElement,
            eleConfig = { translate: `0,0,0`, scale: 100, rotate: 0 },
            w = ele[0].offsetWidth,
            h = ele[0].offsetHeight;

          eleReal.style.width = `${w}px`;
          eleReal.style.height = `${h}px`;
          setConfig(eleReal, eleConfig);
          eleReal.style.position = "absolute";
          eleReal.style.top = eleReal.style.left = "50%";
          eleReal.style.margin = `-${h / 2 + config.padding}px 0 0 -${w / 2 + config.padding}px`;
          eleReal.style.zIndex += 1;
          eleReal.style.padding = `${config.padding}px`;

          touchStart = event => {
            if (JSON.parse(event.target.parentElement.getAttribute(`pd-move`)) && event.target.className.indexOf(`Pd-ImgTransit-btn`)) event.target.style.transform = "scale(1.04)";
            config.callback && config.callback({ type: "choose", obj: event.target });
          };
          touchEnd = event => {
            if (event.target.className.indexOf(`Pd-ImgTransit-btn`)) event.target.style.transform = "scale(1)";
          };
          //移动事件
          touchMove = event => {
            if (event.touches.length < 2) {
              const changePosition = () => {
                let nowX = event.changedTouches[0].pageX,
                  nowY = event.changedTouches[0].pageY,
                  w = event.target.getBoundingClientRect().width,
                  h = event.target.getBoundingClientRect().height,
                  icon = event.target.parentElement.querySelectorAll(`.Pd-ImgTransit-btn`)[0].getBoundingClientRect(),
                  iconW = icon.width / 2;

                touchX = nowX - startX;
                touchY = nowY - startY;
                let getBounding = event.target.parentElement.parentElement.getBoundingClientRect(),
                  parentBox = {
                    width: config.bounds ? getBounding.width + config.outBounds : getBounding.width,
                    height: config.bounds ? getBounding.height + config.outBounds : getBounding.height,
                  };
                if (config.bounds) {
                  if (Math.abs(touchX) >= parentBox.width / 2 - w / 2 - iconW) {
                    if (touchX < 0) {
                      touchX = -1 * (parentBox.width / 2 - w / 2 - iconW);
                    } else {
                      touchX = parentBox.width / 2 - w / 2 - iconW;
                    }
                  }
                  if (Math.abs(touchY) >= parentBox.height / 2 - h / 2 - iconW) {
                    if (touchY < 0) {
                      touchY = -1 * (parentBox.height / 2 - h / 2 - iconW);
                    } else {
                      touchY = parentBox.height / 2 - h / 2 - iconW;
                    }
                  }
                }
                eleConfig.translate = `${touchX}px,${touchY}px,0`;
                setConfig(eleReal, eleConfig);
              };
              config.callback && config.callback({ type: "move", obj: eleReal });
              canMove && changePosition();
            }
          };
          //缩放事件
          touchResize = event => {
            event.stopImmediatePropagation();
            event.preventDefault();
            if (canMove) {
              const x = event.changedTouches[0].pageX - eleReal.getBoundingClientRect().left;
              if (x > 0 && eleConfig.scale > config.scale.min) eleConfig.scale -= config.scale.rate;
              if (x < 0 && eleConfig.scale < config.scale.max) eleConfig.scale += config.scale.rate;
            }

            if (event.touches.length >= 2) {
              if (config.scale.enable) {
                prevScale = event.scale * 100;
                eleConfig.scale = prevScale;
              }

              if (config.rotate.enable) eleConfig.rotate = event.rotation;
            }
            setConfig(eleReal, eleConfig);
            config.callback && config.callback({ type: "resize", obj: eleReal });
          };
          //旋转事件
          touchRotate = event => {
            event.stopImmediatePropagation();
            event.preventDefault();
            const changeRotate = () => {
              const angle = Math.atan2(event.changedTouches[0].pageY - centerPoint.y, event.changedTouches[0].pageX - centerPoint.x);
              eleConfig.rotate = Math.floor(((angle - prevAngle) * 180) / Math.PI) * config.rotate.rate;
              setConfig(eleReal, eleConfig);
            };
            config.callback && config.callback({ type: "rotate", obj: eleReal });
            canMove && changeRotate();
          };
          //删除事件
          touchDelete = event => {
            event.stopImmediatePropagation();
            event.preventDefault();
            const deleteObj = () => {
              eleConfig.translate = "0,0,0";
              eleConfig.rotate = 0;
              eleConfig.scale = 100;
              setConfig(eleReal, eleConfig);
              eleReal.style.display = "none";
              config.callback && config.callback({ type: "delete", obj: eleReal });
            };
            canMove && deleteObj();
          };
          //绑定所有操作
          eleReal.addEventListener("touchstart", touchStart);
          eleReal.addEventListener("touchend", touchEnd);
          if (config.move) {
            eleReal.addEventListener("touchstart", event => {
              if (event.touches.length < 2) {
                startX = event.changedTouches[0].pageX - touchX;
                startY = event.changedTouches[0].pageY - touchY;
                eleReal.addEventListener("touchmove", touchMove);
              }
            });
          }
          if (config.scale.enable && config.rotate.enable && config.Gesture) {
            setGesture(eleReal).gesturemove = e => {
              touchResize(e);
              touchRotate(e);
            };
          }
          if (config.icon && config.scale.enable) eleReal.querySelectorAll(`.Pd-resize`)[0].addEventListener("touchmove", touchResize);
          if (config.icon && config.rotate.enable) {
            eleReal.querySelectorAll(`.Pd-rotate`)[0].addEventListener("touchstart", event => {
              centerPoint = getCenterPoint(eleReal);
              prevAngle = Math.atan2(event.changedTouches[0].pageY - centerPoint.y, event.changedTouches[0].pageX - centerPoint.x) - (eleConfig.rotate * Math.PI) / 180;
            });
            eleReal.querySelectorAll(`.Pd-rotate`)[0].addEventListener("touchmove", touchRotate);
          }
          if (config.icon && config.delete) eleReal.querySelectorAll(`.Pd-delete`)[0].addEventListener("touchstart", touchDelete);

          //隐藏操作按钮
          const hideBtn = () => {
            canMove = !1;
            const allCon = document.querySelectorAll(`.Pd-ImgTransit`),
              allBtn = document.querySelectorAll(`.Pd-ImgTransit-btn`);
            for (let a of allCon) a.style.border = "none";
            for (let a of allBtn) a.style.opacity = 0;
          };
          config.icon && hideBtn();

          //显示操作按钮
          const showBtn = tag => {
            canMove = !0;
            const curBtn = tag.querySelectorAll(`.Pd-ImgTransit-btn`);
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
              JSON.parse(event.target.getAttribute(`pd-move`)) && showBtn(event.target);
              if (event.target.parentElement == eleReal) JSON.parse(event.target.parentElement.getAttribute(`pd-move`)) && showBtn(event.target.parentElement);
            } else {
              if (event.target.parentElement) {
                if (JSON.parse(event.target.parentElement.getAttribute(`pd-move`))) {
                  canMove = !0;
                } else {
                  canMove = !1;
                }
              }
            }
          });
        };

        new Promise(next => {
          let eleArr = [];
          imgArr.forEach((current, idx) => {
            let cur = that,
              btn = "";

            if (config.icon) {
              config.scale.enable && (btn += icon.resize);
              config.rotate.enable && (btn += icon.rotate);
              config.delete && (btn += icon.delete);
            }
            this.append(`<div class="Pd-ImgTransit pd_child_${imgIndex[idx]}">${btn}</div>`);
            const imgCon = this.get.querySelectorAll(`.pd_child_${imgIndex[idx]}`)[idx];
            cur.style.transition = "transform .4s ease-in";
            [].slice.call(cur.attributes).forEach(attrs => {
              if (attrs.name !== "style" && attrs.name !== "id" && attrs.name !== "class") imgCon.setAttribute(attrs.name, attrs.value);
            });
            imgCon.appendChild(cur);
            cur.removeAttribute("Pd-move");
            eleArr.push(cur);
            const theImg = new Image();
            theImg.src = cur.src;
            theImg.onload = () => {
              next(eleArr);
            };
            theImg.error = () => {
              console.error(`[${Alphabet[8]} - ImgTransit] 图片加载失败！`);
            };
          });
        }).then(ele => {
          deleteDefault();
          addEvent(ele);
        });
      }
      //微信SDK
      wxSDK(options) {
        const that = this;
        this.usingTrack(`wxSDK`);
        let sharePics,
          hasIcon = !1;
        document.querySelectorAll(`link`).forEach(tag => {
          if (tag.getAttribute(`rel`) == "shortcut icon") {
            sharePics = tag.href;
            hasIcon = !0;
          }
        });

        let config = {
          //相关接口地址(类型：字符串)
          apiUrl: `https://wx.${Alphabet[3]}/wxshare.ashx?url=`,
          //分享sdk版本
          sdk: "https://res.wx.qq.com/open/js/jweixin-1.6.0.js",
          //分享标题(类型：字符串或数组)
          title: ["Share to Timeline", "Share to Friends"],
          //分享描述(类型：字符串)
          desc: "Simple this",
          //分享图(类型：字符串或数组)
          sharePics: sharePics || `https://${Alphabet[3]}/share_ico.jpg`,
          //分享链接(类型：字符串或数组)
          shareLinks: window.location.href,
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
        const scriptTag = document.createElement("script"),
          { apiUrl, sdk, title, desc, shareLinks, debug, jsApiList, callback } = config;
        scriptTag.id = "Pd_share";
        scriptTag.src = `${sdk}?${new Date().getTime()}`;
        if (this.getEle(`#Pd_share`)) new PandoraAPI(`#Pd_share`).remove();
        document.body.appendChild(scriptTag);

        if (!hasIcon) {
          const link = document.createElement(`link`);
          link.rel = "shortcut icon";
          link.href = sharePics;
          link.type = "image/x-icon";
          document.querySelector(`head`).appendChild(link);
          console.warn(`[${Alphabet[9]}] 没有检测到分享图标将使用默认值！`);
        }

        let jsApiLists = ["onMenuShareTimeline", "onMenuShareAppMessage", "updateTimelineShareData", "updateAppMessageShareData"];
        if (jsApiList) {
          jsApiList.map(e => {
            jsApiLists.push(e);
          });
        }

        const isObj = con => {
          if (typeof con === "object") {
            return !0;
          } else {
            return !1;
          }
        };

        const timeLine = {
            title: isObj(title) ? title[0] : title,
            link: isObj(shareLinks) ? shareLinks[0] : shareLinks,
            imgUrl: isObj(config.sharePics) ? config.sharePics[0] : config.sharePics,
          },
          friend = {
            title: isObj(title) ? title[1] : title,
            link: isObj(shareLinks) ? shareLinks[1] : shareLinks,
            imgUrl: isObj(config.sharePics) ? config.sharePics[1] : config.sharePics,
            desc,
          };

        const success = res => {
          const { appId, timestamp, nonceStr, signature } = res;
          wx.config({ debug, appId, timestamp, nonceStr, signature, jsApiList: jsApiLists });
          wx.ready(() => {
            new Promise(next => {
              if (wx.onMenuShareTimeline) {
                const { title, link, imgUrl } = timeLine;
                const { success, error } = callback;
                wx.onMenuShareTimeline({ title, link, imgUrl, success, error });
              } else {
                const { title, link, imgUrl } = timeLine;
                const { success, error } = callback;
                wx.updateTimelineShareData({ title, link, imgUrl, success, error });
              }
              if (wx.onMenuShareAppMessage) {
                const { title, link, imgUrl, desc } = friend;
                const { success, error } = callback;
                wx.onMenuShareAppMessage({ title, desc, link, imgUrl, success, error });
              } else {
                const { title, link, imgUrl, desc } = friend;
                const { success, error } = callback;
                wx.updateAppMessageShareData({ title, desc, link, imgUrl, success, error });
              }
              next();
            }).then(callback.ready);
          });
        };

        scriptTag.onload = () => {
          that.ajax({ url: `${apiUrl}${encodeURIComponent(window.location.href.split(`#`)[0])}`, success });
        };
        return this;
      }
      //懒加载
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
        const imgArr = this.child(`img`).get,
          { width, height, icon } = config;
        let cur = 0,
          lazyArr = [];

        //遍历所有图片
        for (let img of imgArr) {
          if (img.dataset.src) {
            img.width = width;
            img.height = height;
            img.style.background = `url("${icon}") no-repeat center,black`;
            img.style.backgroundSize = `20%`;
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
              img.style.transition = "all .8s ease";

              img.onload = () => {
                let newWidth = Number(img.dataset.width) || img.naturalWidth,
                  newHeight = Number(img.dataset.height) || img.naturalHeight;

                if (img.dataset.width) newHeight = (newWidth / img.naturalWidth) * img.naturalHeight;
                if (img.dataset.height) newWidth = (newHeight / img.naturalHeight) * img.naturalWidth;

                img.width = newWidth;
                img.height = newHeight;
                img.removeAttribute("data-src");
                img.style.background = null;
                img.dataset.width && img.removeAttribute("data-width");
                img.dataset.height && img.removeAttribute("data-height");
                cur++;
                if (cur == lazyArr.length) window.removeEventListener("scroll", checker);

                img.addEventListener("transitionend", () => {
                  img.style.transition = null;
                });
              };

              img.onerror = () => {
                console.error(`[${Alphabet[8]} - LazyLoad] 以下资源发生错误：${img.src}`);
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
    console.warn(`[${Alphabet[9]}] 检测到当前页面已使用JQuery,请使用 new Pandora()`);
  } catch (err) {
    window.$ = element => {
      return new Pandora(element);
    };
  }
})();
