const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { textDetectionFromImage, textDetectionFromPdf } = require("./src/ocr.js")
const { uploadFileToBucket, deleteFile } = require("./src/bucketOperations.js")
const {
  removeCarriageReturn,
  countNumberCharactersInText,
} = require("./src/textControls")

const app = express()
app.disable("x-powered-by")
app.use(bodyParser.json({ limit: "10mb" }))
const corsOptions = {
  methods: ["POST"],
  maxAge: 3600,
}
app.use(cors(corsOptions))

const port = process.env.PORT || 8080

app.post("/", async (req, res) => {
  const { bucketName, data, fileName } = req.body

  await uploadFileToBucket(fileName, bucketName, data)
  let text =
    fileName && fileName.endsWith(".pdf")
      ? await textDetectionFromPdf(fileName, bucketName)
      : await textDetectionFromImage(fileName, bucketName)

  let detectedText = removeCarriageReturn(text)

  let numberCharacters = countNumberCharactersInText(detectedText)

  const resp =
    numberCharacters > 10000
      ? {
          numberCharactersInText: numberCharacters,
          error: "The maximum number of characters is 10 000!",
        }
      : { numberCharactersInText: numberCharacters, text: detectedText }
  deleteFile(fileName, bucketName)
  return res.send(resp)
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
