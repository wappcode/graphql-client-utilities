const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    graphqlutilities: {
      import: './src/graphqlutilities.ts',
      library: {
        // all options under `output.library` can be used here
        name: 'gql',
        type: 'umd',
        umdNamedDefine: true,
      },
    },
    gql: {
      import: './src/gql.ts',
      library: {
        // all options under `output.library` can be used here
        name: 'gql',
        type: 'umd',
        umdNamedDefine: true,
      },
    },
    types: {
      import: './src/types.ts',
      library: {
        // all options under `output.library` can be used here
        name: 'types',
        type: 'umd',
        umdNamedDefine: true,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/package.json', to: 'src' },
        { from: 'README.md', to: 'src' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: [nodeExternals()], // excluye las librerias de node al compilar
  output: {
    filename: 'src/[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    globalObject: 'this',
  },
};
