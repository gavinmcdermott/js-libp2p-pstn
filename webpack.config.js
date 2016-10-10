module.exports = {
  entry: [
    './client/scripts/index.js'
  ],
  output: {
    path: '.',
    filename: './client/build/bundle.js'
  },

  resolve: {
    // Allow to omit extensions when requiring these files
    extensions: ['', '.js']
  },
  watchDelay: 0,
  watch: true,
  externals: {},
  devtool: '#inline-source-map',
  module: {
    loaders: [
      // handle stylesheets required from node packages
      { test: /\.css$/, loader: 'style-loader!css-loader'},
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
      }
    ]
  }
};
