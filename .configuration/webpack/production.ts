import path from 'path'
import { merge } from 'webpack-merge'
import webpack from 'webpack'
import dotenv from 'dotenv'

import manifest from '../../manifest.json'

import base from './base'

// read ONLY the front-end env file
// const env = dotenv.config({ path: path.resolve(__dirname, '../../app/.env') }).parsed || {};
const env = dotenv.config().parsed || {};

// convert to DefinePlugin format
const envKeys = Object.entries(env)
  .filter(([key]) => key.startsWith('REACT_APP_'))
  .reduce<Record<string, string>>((acc, [key, value]) => {
    acc[`process.env.${key}`] = JSON.stringify(value);
    return acc;
  }, {});


export default merge(base, {
  mode: 'production',
  output: {
    filename: `bundle.${manifest.build}.js`,
    path: path.resolve(__dirname, '../../dist-web')
  },
  plugins: [new webpack.DefinePlugin(envKeys)]
});