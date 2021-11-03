// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// Init express.js app
const app = express()
app.disable('x-powered-by')

app.use(bodyParser.json())

app.use(cors())

// this is atest
app.get('/', async (req, res) => {
  var idDGASI = req.query.idDGASI;
  console.log('idDGASI:',idDGASI);
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
