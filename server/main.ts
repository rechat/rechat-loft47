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
  cors(
    (
      req: Request,
      callback: (err: Error | null, options?: CorsOptions) => void
    ) => {
      const isAssetRequest =
        /bundle\.\d+\.js|bundle\.js\?v=\w+/.test(req.originalUrl) ||
        req.originalUrl.endsWith('.json')

      const allowedOrigins = ['https://app.rechat.com']
      const origin = req.header('Origin')

      const allow =
        isAssetRequest || (origin && allowedOrigins.includes(origin))

      callback(null, {
        origin: allow,
        credentials: true // if you're using cookies/sessions
      })
    }
  )
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
}

if (isProduction) {
  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  // app.use(enforce.HTTPS())

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
  workers: isDevelopment
    ? 1
    : process.env.WEB_CONCURRENCY || Math.max(os.cpus().length, 8) || 1,
  lifetime: Infinity,
  start: () => {
    app.listen(port, () => console.log(`App is started on 0.0.0.0:${port}`))
  }
})
