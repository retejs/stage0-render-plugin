import postcss from 'rollup-plugin-postcss'

const isWatching = process.argv.includes('-w') || process.argv.includes('--watch')

var postCssOptions = {
  plugins: [],
  extensions: [".sass"],
  inject: false,
  sourceMap: true
};

if(isWatching){
  postCssOptions["minimize"] = false;
  postCssOptions["extract"] = 'build/stage0-render-plugin.debug.css';
}else{
  postCssOptions["minimize"] = true;
  postCssOptions["extract"] = 'build/stage0-render-plugin.min.css';
}

export default {
  input: "src/index.js",
  name: "Stage0RenderPlugin",
  globals: {
    stage0: "stage0",
    "stage0/keyed": "stage0"
  },
  plugins: [
    postcss(postCssOptions)
  ]
};
