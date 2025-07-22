import path from 'path';
import { merge } from 'webpack-merge';
import webpack from 'webpack';
import Webpackbar from 'webpackbar';
import dotenv from 'dotenv';
import base from './base';

// read ONLY the front-end env file
const env = dotenv.config({ path: path.resolve(__dirname, '../../app/.env') })
                 .parsed || {};

// convert to DefinePlugin format
const envKeys = Object.fromEntries(
  Object.entries(env).map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
);

export default merge(base, {
  mode: 'development',
  output: { filename: 'bundle.js' },
  plugins: [
    new Webpackbar(),
    new webpack.DefinePlugin(envKeys)   // ← inject variables
  ]
});