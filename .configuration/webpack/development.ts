import { merge } from 'webpack-merge'
import Webpackbar from 'webpackbar'

import webpack from 'webpack';
import type { Configuration } from 'webpack'

import dotenv from 'dotenv';

const env = dotenv.config().parsed || {};
const envKeys = Object.entries(env).reduce<Record<string, string>>((acc, [key, value]) => {
  acc[`process.env.${key}`] = JSON.stringify(value);
  return acc;
}, {});

import base from './base'

const config: Configuration = {
  mode: 'development',
  output: {
    filename: 'bundle.js'
  },
  plugins: [
    new Webpackbar(),
    new webpack.DefinePlugin(envKeys)
  ]
}

export default merge(base, config)