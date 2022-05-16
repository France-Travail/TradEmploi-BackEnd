'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
// Imports the Google Cloud Translation library
const {TranslationServiceClient} = require('@google-cloud/translate');
const app = express()
app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(cors())


const location = 'europe-west1'
const apiEndpoint = 'translate-eu.googleapis.com'



app.post('/', async (req, res) => {
  const translatedText = await translateText(req.body.projectId, req.body.text, req.body.targetLanguageCode, req.body.sourceLanguageCode);
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


const clientOptions = {apiEndpoint};
const translationClient = new TranslationServiceClient(clientOptions);


async function translateText(projectId, text, targetLanguageCode, sourceLanguageCode) {

  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode,
    targetLanguageCode
  };

  const [response] = await translationClient.translateText(request);

  return response.translations[0].translatedText;
}


process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});


