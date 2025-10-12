import os from 'os'
import path from 'path'

import compress from 'compression'
import cors, { CorsOptions } from 'cors'
import dotenv from 'dotenv'
import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import enforce from 'express-sslify'
import serveStatic from 'serve-static'
import throng from 'throng'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'

dotenv.config()

import routes from './routes'

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

const app = express()
const port = process.env.PORT || 8081

app.use(compress())

// Parse incoming JSON bodies
app.use(express.json())

app.use(
  cors({
    origin: ['https://app.rechat.com'],
    credentials: true
  })
)

app.use(
  session({
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: isProduction, // true if using HTTPS
      sameSite: 'lax'
    }
  })
)

app.use(routes)
app.use(haltOnTimedout)

if (isDevelopment) {
  const config = require('../webpack.config').default

  const compiler = webpack(config)

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath
    })
  )

  app.use('/static', express.static(path.resolve(__dirname, '../app/static')))
  // Serve manifest.json from root in development
  app.use('/manifest.json', express.static(path.resolve(__dirname, '../manifest.json')))
}

if (isProduction) {
  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(enforce.HTTPS())

  app.use(
    '/',
    serveStatic(path.resolve(__dirname, '../dist-web'))
  )
}

function haltOnTimedout(
  req: Request & {
    timedout: boolean
  },
  _: Response,
  next: NextFunction
) {
  if (req.timedout) {
    console.error(`[ Timeout ] ${req.method}\t ${req.url}`)
  }

  next()
}

throng({
  workers: 1,
  lifetime: Infinity,
  start: () => {
    app.listen(port, () => console.log(`App is started on 0.0.0.0:${port}`))
  }
})
