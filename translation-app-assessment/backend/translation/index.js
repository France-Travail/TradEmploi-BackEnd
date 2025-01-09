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
  origin: 'http://localhost:4200',
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
  const useDeepl = false;
  const currentUserDomain = req.body.currentUserDomain
  const isTradTonDoc = req.body.isTradTonDoc
  const translatedText =
    deeplLanguages.includes(targetLanguageSplitted) &&
    deeplLanguages.includes(sourceLanguageSplitted) &&
    useDeepl
      ? await translateWithDeepl(
          req.body.text,
          req.body.targetLanguageCode,
          req.body.sourceLanguageCode,
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

const port = process.env.PORT || 8081
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
  targetLanguageCode = getLanguageName(targetLanguageCode);
  console.log(targetLanguageCode)
  console.log(text);
  const requestBody = {
    messages: [
      { role: "user", content: `Translate the following from French to English: ${text}.` }
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: false
  };

  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(data.choices[0].message.content);
    return data.choices[0].message.content; // Adapter en fonction du format de la réponse
  } catch (error) {
    console.error("Error during translation request:", error.message);
    throw error;
  }
}

process.on("unhandledRejection", (err) => {
  console.error(err.message);
  process.exitCode = 1;
});

function getLanguageName(languageCode) {
  switch (languageCode) {
    case "de-DE":
      return "Allemand";
    case "fr-FR":
      return "Français";
    case "en-US":
    case "en-GB":
      return "Anglais";
    case "es-ES":
      return "Espagnol";
    case "it-IT":
      return "Italien";
    case "pt-PT":
      return "Portugais";
    case "nl-NL":
      return "Néerlandais";
    case "ja-JP":
      return "Japonais";
    case "zh-CN":
      return "Chinois";
    case "ru-RU":
      return "Russe";
    // Ajoute d'autres langues si nécessaire
    default:
      return "Langue inconnue";
  }
}

