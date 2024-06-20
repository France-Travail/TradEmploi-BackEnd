"use strict"
const express = require("express")
const bodyParser = require("body-parser")
// Imports the Google Cloud Translation library
const { TranslationServiceClient } = require("@google-cloud/translate")
const { translateWithDeepl } = require("./src/deepl")
const { deeplLanguages } = require("./src/languages")
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
require("dotenv");

const app = express()
app.disable("x-powered-by")
app.use(bodyParser.json())

app.use(cookieParser())

app.use(helmet())

const cors = require('cors');

const corsOptions = {
  origin: 'https://pole-emploi-trad-dev.firebaseapp.com',
  credentials: true,  // Permet les requêtes incluant les cookies
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

const location = "europe-west1"
const apiEndpoint = "translate-eu.googleapis.com"
const useDeepl = process.env.DEEPL_API_KEY
const port = process.env.PORT || 8080
const gcp = process.env.GCP_PROJECT

app.post("/", async (req, res, next) => {

  try {
    const translatedText = (await getTranslatedText([req.body.text], req.body.sourceLanguageCode, req.body.targetLanguageCode, 'plaintext'))[0]

    const response = {
      status: 200,
      translatedText
    }
    res.send(response)
  }
  catch (e) {
    next(e);
  }
})

async function getTranslatedText(texts, sourceLanguageCode, targetLanguageCode, type) {
  const sourceLanguageSplitted = sourceLanguageCode
      .split("-")[0]
      .toUpperCase()
  const targetLanguageSplitted = targetLanguageCode
      .split("-")[0]
      .toUpperCase()

  const translatedText =
      deeplLanguages.includes(targetLanguageSplitted) &&
      deeplLanguages.includes(sourceLanguageSplitted) &&
      useDeepl
          ? await translateWithDeepl(
              texts,
              targetLanguageSplitted,
              sourceLanguageSplitted,
              type
          )
          : await translateText(
              texts,
              targetLanguageCode,
              sourceLanguageCode,
              type
          )
  return translatedText;
}

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

const clientOptions = { apiEndpoint }
const translationClient = new TranslationServiceClient(clientOptions)

async function translateText(
    texts,
    targetLanguageCode,
    sourceLanguageCode,
    type
) {
  console.log("Use google cloud translation from ", sourceLanguageCode, " to ", targetLanguageCode)
  const request = {
    parent: `projects/${gcp}/locations/${location}`,
    contents: texts,
    mimeType: type === 'html' ? "text/html" : "text/plain",
    sourceLanguageCode,
    targetLanguageCode,
  }

  const [response] = await translationClient.translateText(request)

  const textsTranslated = [];

  response.translations.forEach(translation => {
    textsTranslated.push(translation.translatedText)
  })
  return textsTranslated
}

app.use(function (err, req, res, /*unused*/ next) {
  console.error(err)
  res.status(500)
  res.send({ error: err })
})

process.on("unhandledRejection", (err) => {
  console.error('unhandledRejection : ' + err.message)
  process.exitCode = 1
})
