const path = require("path");

module.exports = {
  mode: "none",
  entry: path.resolve(__dirname, "Pandora.js"),
  output: {
    path: path.resolve(__dirname, ""),
    filename: "./Pandora.min.js",
  },
  // devtool: "source-map",
};
