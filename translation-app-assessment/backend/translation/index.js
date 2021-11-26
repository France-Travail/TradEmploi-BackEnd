// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
// Imports the Google Cloud Translation library
const {TranslationServiceClient} = require('@google-cloud/translate');
// Init express.js app
const app = express()
app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(cors())


const location = 'europe-west1'
const apiEndpoint = 'translate-eu.googleapis.com'



app.post('/', async (req, res) => {
  const translatedText = await translateText(req.body.projectId, req.body.text, req.body.targetLanguageCode);
  const response = {
    status: 200,
    translatedText
  }
  res.send(response);
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})


// Instantiates a client
const clientOptions = {apiEndpoint};
const translationClient = new TranslationServiceClient(clientOptions);


async function translateText(projectId, text, targetLanguageCode) {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    targetLanguageCode
  };

  // Run request
  const [response] = await translationClient.translateText(request);

  return response.translations[0].translatedText;
}


process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});


