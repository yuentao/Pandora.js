# Pandora.js

#### 专为新手优化的JavaScript插件库，具备前端最常使用的插件，插件属性丰富，足以满足大部分前端的功能需求。

## 基础方法
```javascript
window.alert(`文本内容`);
window.confirm({
  //文本内容(类型：字符串)
  content: `提示内容`,
  //确认按钮文本(类型：字符串)
  confirmText: `确认`,
  //取消按钮文本(类型：字符串)
  cancelText: `取消`,
  //点击确定(类型：方法)
  success() {},
  //点击取消(类型：方法)
  fail() {},
});
```

```javascript
window.showLoading();
window.hideLoading();
```

> 必须在 $ 关键字未被占用情况下使用否则请使用 new Pandora
> 示例：new Pandora(`元素`).css(`width`);

## DOM操作

```javascript
//获取原生dom元素
$(`元素`).get;
//遍历元素
$(`元素`).each((current, index) => {});
//选择子级元素
$(`元素`).child(`p`);
//选择指定下标元素
$(`元素`).eq(0);
```

```javascript
//获取宽度
$(`元素`).css(`width`);
//设置宽度
$(`元素`).css(`width`, `200px`);
```

```javascript
//获取文本内容
$(`元素`).text();
//修改文本内容
$(`元素`).text(`文字`);
```

```javascript
//获取值
$(`元素`).val();
//修改值
$(`元素`).val(`值`);
```

```javascript
//获取页面结构
$(`元素`).html();
//插入页面结构
$(`元素`).html(`<p>插入的P标签</p>`);
```

```javascript
//在...之前插入结构
$(`元素`).prepend(`<dfn>在...之前插入的dfn标签</dfn>`);
//在...之后插入结构
$(`元素`).append(`<i>在...之后插入的i标签</i>`);
```

```javascript
//清空容器
$(`元素`).empty();
//移除元素
$(`要移除的元素`).remove();
```

```javascript
//是否含有class（返回true或false）
$(`元素`).hasClass(`class名`);
//添加class
$(`元素`).addClass(`class名`);
//移除class
$(`元素`).removeClass(`class名`);
```

```javascript
//获取属性
$(`元素`).attr(`属性名`);
//添加属性
$(`元素`).attr(`属性名`, `属性值`);
//移除属性
$(`元素`).removeAttr(`属性名`);
```

```javascript
//显示
$(`元素`).show(callback);
//隐藏
$(`元素`).hide();
```

```javascript
//ajax
$().ajax({
    //接口地址(类型：字符串)
    url: null,
    //请求类型(类型：字符串；可选参数：post、get)
    type: "get",
    //是否同步请求(类型：布尔)
    async: true,
    //发送数据类型(类型：字符串；可选参数：json、form)
    dataType: "json",
    //发送数据(类型：json或form；格式必须和发送数据类型保持一致)
    data: null,
    //成功回调方法(类型：方法；返回类型：对象)
    success: null,
    //失败回调方法(类型：方法)
    error: null
});
```

```javascript
//fetch(纯异步请求方法；性能优于ajax)
$().fetch({
    //接口地址(类型：字符串)
    url: null,
    //请求类型(类型：字符串；可选参数：post、get、put)
    type: "get",
    //发送数据(类型：JSON或FormData；格式必须和请求类型相对应)
    data: null,
    //成功回调方法(类型：方法；返回类型：对象)
    success: null,
    //失败回调方法(类型：方法)
    error: null
});
```

```javascript
let element = $("元素");
//事件绑定
element.bind("事件名", callback, 是否捕获);
//事件解绑
element.unbind("事件名");

//事件
$(`元素`).click(callback);
$(`元素`).taping(callback);
$(`元素`).change(callback);
$(`元素`).input(callback);
$(`元素`).hover(移入, 移出);
$(`元素`).scroll(callback);
$(`元素`).ontransition(callback);
```
