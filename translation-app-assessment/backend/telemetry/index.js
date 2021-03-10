// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const express = require('express')

// Init express.js app
const app = express()
app.disable('x-powered-by')


// this is atest
app.get('/', async (req, res) => {
  res.send('Hi! This is the telemetry service!')
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
