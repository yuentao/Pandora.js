const path = require("path");

module.exports = {
  watch: true,
  watchOptions: {
    poll: 1000, // 每秒询问多少次
    aggregateTimeout: 200, //防抖 多少毫秒后再次触发
  },
  entry: path.resolve(__dirname, "Pandora.js"),
  output: { filename: "Pandora.min.js" },
};
