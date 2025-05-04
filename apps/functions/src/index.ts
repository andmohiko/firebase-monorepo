import * as functions from 'firebase-functions/v1'

import router from './router'

const cors = require('cors')({ origin: true })
const express = require('express')
const app = express()

const timezone = 'Asia/Tokyo'
process.env.TZ = timezone

app.use(cors)
app.use(router)

// triggers

// API
exports.api = functions
  .runWith({
    memory: '1GB' as const,
  })
  .https.onRequest(app)
