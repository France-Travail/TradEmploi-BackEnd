// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const express = require('express')

// Init express.js app
const app = express()
app.disable('x-powered-by')

app.use(bodyParser.json())

app.use(cors())

// this is atest
app.get('/', async (req, res) => {
  var agence = req.query.agence;
  console.log('agence:',agence);
  const response = {
    status: 200,
    message: 'Hi! This is the telemetry service!'
  }
  res.send(response)
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
