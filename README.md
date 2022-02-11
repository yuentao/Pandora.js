# Pandora.js

#### 专为新手优化的 JavaScript 插件，拥有前端较为常用的功能，属性丰富。

## 基础方法

```javascript
//提示框
window.alert(`文本内容`);
//确认框
window.confirm(`文本内容`).then(确认回调).catch(取消回调);
window.confirm({
  //文本内容(类型：字符串)
  content: `提示内容`,
  //是否显示确认按钮(类型：布尔)
  showConfirm:true,
  //确认按钮文本(类型：字符串)
  confirmText: `确认`,
  //是否显示取消按钮(类型：布尔)
  showCancel:true,
  //取消按钮文本(类型：字符串)
  cancelText: `取消`,
  //点击确定(类型：方法)
  success() {},
  //点击取消(类型：方法)
  fail() {},
});
```

> 重置后的alert和confirm可修改样式（建议放置于样式表最顶部）
```css
:root{
    //alert背景色
    --alertTheme: white;
    //alert遮罩颜色
    --alertBg: inherit;
    //alert字体大小
    --alertFontSize: 1.2rem;
    //alert字体颜色
    --alertColor: #000;
    //confirm背景色
    --confirmTheme: white;
    //confirm遮罩颜色
    --confirmBg: inherit;
    //confirm字体大小
    --confirmFontSize: 1.2rem;
    //confirm字体颜色
    --confirmColor: #000;
    //confirm按钮颜色
    --confirmBtnBg: #8477b6;
    //confirm按钮字体颜色
    --confirmBtnColor: #fff;
}
```

```javascript
//显示加载蒙层
window.showLoading();
window.showLoading(`可传入数字作为进度显示`);
//隐藏加载蒙层
window.hideLoading();
```

> 必须在 \$ 关键字未被占用情况下使用否则请使用 new Pandora
> 示例：new Pandora(`元素`).css(`width`);

## DOM 操作

```javascript
//获取原生dom元素
$(`元素`).get;
//遍历元素
$(`元素`).each((current, index) => {});
//选择父级元素
$(`元素`).parent();
//选择子级元素
$(`元素`).child(`p`);
//选择指定下标元素
$(`元素`).eq(0);
//选择其他同级元素
$(`元素`).siblings(`元素`);
//选择上一个同级元素
$(`元素`).prev();
//选择下一个同级元素
$(`元素`).next();
//选择第一个同级元素
$(`元素`).first();
//选择最后一个同级元素
$(`元素`).last();
```

```javascript
//获取样式
$(`元素`).css(`width`);
//设置样式
$(`元素`).css({ `width`: `200px`});
//获取宽度
$(`元素`).width();
//设置宽度
$(`元素`).width(`200px`);
//获取高度
$(`元素`).height();
//设置高度
$(`元素`).height(`200px`);
//获取布局信息
$(`元素`).offset();
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
$(`元素`).html(`插入的内容`);
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
//添加多条属性
$(`元素`).attr({`属性名1`: `属性值1`,`属性名2`: `属性值2`});
//移除属性
$(`元素`).removeAttr(`属性名`);
```

```javascript
//显示
$(`元素`).show(callback);
//隐藏
$(`元素`).hide(callback);
//淡入
$(`元素`).fadeIn("fast",callback);
//淡出
$(`元素`).fadeOut("slow",callback);
```

```javascript
//ajax
//以下所有参数值均为默认值
$().ajax({
    //接口地址(类型：字符串)
    url: null,
    //请求类型(类型：字符串)
    type: "get",
    //是否异步请求(类型：布尔)
    async: false,
    //设置请求头(类型：JSON)
    headers: { "Content-Type": "application/json" },
    //发送数据类型(类型：字符串；可选参数：json、form)
    dataType: "json",
    //发送数据(类型：json或form；格式必须和发送数据类型保持一致)
    data: null,
    //请求中回调方法(类型：方法；返回类型：数字)
    progress: null,
    //成功回调方法(类型：方法；返回类型：对象)
    success: null,
    //失败回调方法(类型：方法)
    error: null
});
```

```javascript
//fetch
//以下所有参数值均为默认值
$().fetch({
    //接口地址(类型：字符串)
    url: null,
    //请求类型(类型：字符串)
    type: "get",
    //设置请求头(类型：JSON)
    headers: { "Content-Type": "application/json" },
    //发送数据(类型：JSON)
    data: null,
    //返回数据格式化(类型：方法)
    returnData:function(res) {
        return res.json();
    },
    //成功回调方法(类型：方法；返回类型：对象)
    success: null,
    //失败回调方法(类型：方法)
    error: null
});
```

```javascript
//表单序列化
$(`表单`).serialize();

//获取url参数并转换成对象
$().getParams();

//点击事件
$(`元素`).click(callback);
//长按事件
$(`元素`).taping(callback);
//事件绑定
$("元素").bind("事件名", callback, 是否捕获);
//事件解绑
$("元素").unbind("事件名");

// 打乱数组
$([0,1,2]).Array.Random();  //[1,2,0]
//是否存在重复
$([0,1,1]).Array.hasRepeat();  //true
// 数组求和
$([1,1,1]).Array.Sum(); //3

//是否开启插件跟踪统计（默认开启）
window.enableTrack = true;
//是否启用内置alert（默认开启）
window.resetAlert  = true;
//是否启用内置confirm（默认开启）
window.resetConfirm  = true;

//tips:大多数函数均支持链式写法，包括构造函数和拓展函数
```
