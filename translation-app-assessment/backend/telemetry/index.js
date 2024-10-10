// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.
'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,  // Permet les requêtes incluant les cookies
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  methods: ['POST'],
};
const app = express()
app.use(cors(corsOptions));
app.disable('x-powered-by')

app.use(bodyParser.json())

app.get('/', async (req, res, next) => {
  try {
    var hashedEmail = req.query.hashedEmail;
    console.log('hashed email:',hashedEmail);
    const response = {
      status: 200,
      idDGASI,
      message: 'Hi! This is the telemetry service!'
    }
    res.send(response)
  } catch(e) {
    next(e)
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
