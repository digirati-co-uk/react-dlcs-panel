module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'DLCS',
      externals: {
        react: 'React'
      }
    }
  },
  webpack: {
    extra: {
      module: {
        rules: [{
            test: /\.scss$/,
            use: [
                "style-loader", // creates style nodes from JS strings
                "css-loader", // translates CSS into CommonJS
                "sass-loader" // compiles Sass to CSS
            ]
        }]
      }
    }
  }
}
