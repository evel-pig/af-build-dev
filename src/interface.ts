import { ExternalsElement, Condition, Configuration, Entry, Stats } from 'webpack';
import IWebpackChainConfig from 'webpack-chain';
import express from 'express';
import WebpackDevServer from 'webpack-dev-server';
import PluginApi from './PluginApi';
import { ScriptEnhanceOption } from './webpack-plugins/webpack-plugin-script-enhance';

export { Configuration } from 'webpack';

export interface IAFWebpackConfig {
  alias?: object; // https://webpack.js.org/configuration/resolve/#resolve-alias
  autoprefixer?: object; // https://github.com/ai/browserslist
  babel?: object;
  browserslist?: string[]; // https://github.com/ai/browserslist
  chainConfig?: any; // https://github.com/mozilla-neutrino/webpack-chain
  copy?: any[]; // https://github.com/webpack-contrib/copy-webpack-plugin
  cssLoaderOptions?: any; // https://github.com/webpack-contrib/css-loader
  cssModulesExcludes?: string[];
  cssModulesWithAffix?: boolean;
  cssnano?: object;
  cssPublicPath?: string;
  define?: object;
  devServer?: object; // https://webpack.js.org/configuration/dev-server/#devserver
  devtool?: string | false; // https://webpack.js.org/configuration/devtool/
  disableCSSModules?: boolean;
  disableCSSSourceMap?: boolean;
  disableDynamicImport?: boolean;
  disableGlobalVariables?: boolean;
  cssLoaderVersion?: 1 | 2;
  entry?: any;
  env?: object;
  es5ImcompatibleVersions?: boolean;
  externals?: ExternalsElement; // https://webpack.js.org/configuration/externals/
  extraBabelIncludes?: Condition[]; // https://webpack.js.org/configuration/module/#condition
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  extraPostCSSPlugins?: any[];
  hash?: boolean;
  ignoreMomentLocale?: boolean;
  lessLoaderOptions?: any; // https://github.com/webpack-contrib/less-loader
  manifest?: any; // https://www.npmjs.com/package/webpack-manifest-plugin
  minimizer?: 'uglifyjs' | 'terserjs';
  outputPath?: string;
  proxy?: object | [object, Function]; // https://webpack.js.org/configuration/dev-server/#devserver-proxy
  publicPath?: string;
  sass?: object; // https://github.com/sass/node-sass#options
  terserJSOptions?: object;
  theme?: string | object;
  tsConfigFile?: string;
  typescript?: object;
  uglifyJSOptions?: object;
  urlLoaderExcludes?: Condition[];
}

export type IPlugin<T = any> = string | [string, T];

export interface EpigConfig extends IAFWebpackConfig {
  plugins?: IPlugin[];
  chainWebpack?: (chainWebpack: IWebpackChainConfig, { webpack }) => void;
  treeShaking?: boolean;
  targets?: {
    [key: string]: number;
  };
  gzip?: boolean;
  scripts?: ScriptEnhanceOption[];
}

export type EventMethod<T = {}> = (fn: (args: T) => void) => void;
export type MoidfyMethod<T, U = {}> = (fn: (memo: T, args: U) => T) => void;

export type IPluginApi = PluginApi;

export interface IApi extends IPluginApi {
  modifyAFWebpackOpts: MoidfyMethod<IAFWebpackConfig>;
  chainWebpackConfig: EventMethod<{ chainWebpack: IWebpackChainConfig }>;
  modifyEntry: MoidfyMethod<Entry>;
  modifyWebpackConfig: MoidfyMethod<Configuration>;
  /** only in dev env*/
  onStart: EventMethod;
  beforeServerWithApp: EventMethod<{ app: express.Application }>;
  beforeDevServer: EventMethod<{ devServer: WebpackDevServer }>;
  afterDevServer: EventMethod<{ devServer: WebpackDevServer }>;
  onDevCompileDone: EventMethod<{ stats: Stats }>;
  /** only in build env*/
  onBuildSuccess: EventMethod<{ stats: Stats }>;
  onBuildFail: EventMethod<{ stats: Stats, err: any }>;
}
