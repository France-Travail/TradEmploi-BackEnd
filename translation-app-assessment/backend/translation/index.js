"use strict"
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
// Imports the Google Cloud Translation library
const { TranslationServiceClient } = require("@google-cloud/translate")
const { translateWithDeepl } = require("./src/deepl")
const { deeplLanguages } = require("./src/languages")
const app = express()
app.disable("x-powered-by")
app.use(bodyParser.json())

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,  // Permet les requêtes incluant les cookies
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  methods: ['POST'],
};

app.use(cors(corsOptions));


const location = "europe-west1"
const apiEndpoint = "translate-eu.googleapis.com"

app.post("/", async (req, res) => {
  const sourceLanguageSplitted = req.body.sourceLanguageCode
    .split("-")[0]
    .toUpperCase()
  const targetLanguageSplitted = req.body.targetLanguageCode
    .split("-")[0]
    .toUpperCase()
  const useDeepl = process.env.DEEPL_API_KEY
  const currentUserDomain = req.body.currentUserDomain
  const isTradTonDoc = req.body.isTradTonDoc

  const translatedText =
    deeplLanguages.includes(targetLanguageSplitted) &&
    deeplLanguages.includes(sourceLanguageSplitted) &&
    useDeepl
      ? await translateWithDeepl(
          req.body.text,
          targetLanguageSplitted,
          sourceLanguageSplitted,
          currentUserDomain,
          isTradTonDoc
        )
      : await translateText(
          req.body.projectId,
          req.body.text,
          req.body.targetLanguageCode,
          req.body.sourceLanguageCode,
          currentUserDomain,
          isTradTonDoc
        )

  const response = {
    status: 200,
    translatedText,
  }
  res.send(response)
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

const clientOptions = { apiEndpoint }
const translationClient = new TranslationServiceClient(clientOptions)

async function translateText(
  projectId,
  text,
  targetLanguageCode,
  sourceLanguageCode,
  currentUserDomain,
  isTradTonDoc
) {
  console.log(`Use Google cloud translation from ${sourceLanguageCode} to ${targetLanguageCode} by ${currentUserDomain} for ${isTradTonDoc ? 'TradTonDoc' : 'Chat'}`)
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: "text/plain",
    sourceLanguageCode,
    targetLanguageCode,
  }

  const [response] = await translationClient.translateText(request)

  return response.translations[0].translatedText
}

process.on("unhandledRejection", (err) => {
  console.error(err.message)
  process.exitCode = 1
})
