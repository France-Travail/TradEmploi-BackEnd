// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.
"use strict"
const express = require("express")
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv')

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

app.use(cookieParser())
app.use(helmet())

// Middleware to verify CSRF token
const verifyCsrfToken = (req, res, next) => {
  const csrfTokenFromClient = req.headers['x-csrf-token'];
  const csrfTokenFromSession = req.cookies.csrfToken;

  if (csrfTokenFromClient && csrfTokenFromClient === csrfTokenFromSession) {
    return next();
  }

  res.status(403).send('Invalid CSRF token');
};


app.get('/', async (req, res, next) => {
  try {
    var idDGASI = req.query.idDGASI;
    console.log('idDGASI:', idDGASI);
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

app.use(function (err, req, res, /*unused*/ next) {
  console.error(err)
  res.status(500)
  res.send({ error: err })
})

const port = process.env.PORT || 8082
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
