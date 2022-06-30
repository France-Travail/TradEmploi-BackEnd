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
app.use(cors())

const location = "europe-west1"
const apiEndpoint = "translate-eu.googleapis.com"

app.post("/", async (req, res) => {
  const sourceLanguageSplitted = req.body.sourceLanguageCode.split("-")[0].toUpperCase();
  const targetLanguageSplitted = req.body.targetLanguageCode.split("-")[0].toUpperCase();
  const translatedText = deeplLanguages.includes(targetLanguageSplitted) && deeplLanguages.includes(sourceLanguageSplitted)
    ? await translateWithDeepl(
        req.body.text,
        targetLanguageSplitted,
        sourceLanguageSplitted
      )
    : await translateText(
        req.body.projectId,
        req.body.text,
        req.body.targetLanguageCode,
        req.body.sourceLanguageCode
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
  sourceLanguageCode
) {
  console.log("Use google cloud translation")
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
