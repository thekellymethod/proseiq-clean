const {
    defineConfig,
} = require("eslint/config");

const {
    plugins = [
        "react-hooks"
    ],
    rules = {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    extends : ["next/core-web-vitals"],
  } = require("eslint-plugin-react-hooks");

module.exports = defineConfig({
    plugins: plugins,
    rules: rules,
    extends: extends
});
  