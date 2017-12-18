import { resolve, join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import fromPairs from 'lodash/fromPairs'
import vueLoader from './loader'
import babel from './babel'
import styleLoader from './style'
import babelOption from './babel';
import webpack from 'webpack'

export default function (baseOption, builderOption) {
  return {
    devtool: baseOption.dev ? 'cheap-module-eval-source-map' : false,
    entry: fromPairs(builderOption.entries
      .map(({ entryName }) => {
        let src = resolve(builderOption.generateAppRoot, 'entries', entryName, 'index.js')
        src = baseOption.dev ? [resolve(__dirname, '../lib/config/client')].concat(src) : src
        return [entryName, src]
      })),
    output: {
      filename: baseOption.assetsPath + 'js/[name].[hash].js',
      chunkFilename: baseOption.assetsPath + 'js/[name].[chunkhash].js',
      path: resolve(baseOption.rootDir, 'dist'),
      publicPath: '/'
    },
    performance: {
      maxEntrypointSize: 1000000,
      maxAssetSize: 300000,
      hints: baseOption.dev ? false : 'warning'
    },
    resolve: {
      extensions: ['.js', '.json', '.vue', '.ts'],
      alias: {
        '~': join(baseOption.srcDir),
        '@': join(baseOption.srcDir),
        '@@': join(baseOption.rootDir),
        '@@@': join(baseOption.rootDir, '.her'),
        'assets': join(baseOption.srcDir, 'assets')
      }
    },
    module: {
      noParse: /es6-promise\.js$/,
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: vueLoader(baseOption)
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: babel(baseOption)
        },
        { test: /\.css$/, use: styleLoader(baseOption, 'css') },
        { test: /\.less$/, use: styleLoader(baseOption, 'less', 'less-loader') },
        { test: /\.sass$/, use: styleLoader(baseOption, 'sass', { loader: 'sass-loader', options: { indentedSyntax: true } }) },
        { test: /\.scss$/, use: styleLoader(baseOption, 'scss', 'sass-loader') },
        { test: /\.styl(us)?$/, use: styleLoader(baseOption, 'stylus', 'stylus-loader') },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 1000, // 1KO
            name: baseOption.assetsPath + 'img/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 1000, // 1 KO
            name: baseOption.assetsPath + 'fonts/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(webm|mp4)$/,
          loader: 'file-loader',
          options: {
            name: baseOption.assetsPath + 'videos/[name].[hash:7].[ext]'
          }
        }
      ]
    },
    plugins: [
      ...builderOption.entries.map(
        ({ entryName }, i) => {
          return new HtmlWebpackPlugin({
            filename: (baseOption.entry && baseOption.entry == entryName) || (!baseOption.entry && i == 0)
              ? 'index.html'
              : `${entryName}.html`,
            template: resolve(baseOption.srcDir, 'entries', entryName, 'index.html'),
            chunks: [entryName]
          })
        }),
      ...baseOption.dev ? [new webpack.HotModuleReplacementPlugin()] : []
    ]
  }
}