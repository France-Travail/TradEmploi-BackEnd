const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { textDetectionFromImage, textDetectionFromPdf } = require("./src/ocr.js")
const { uploadFileToBucket, deleteFile } = require("./src/bucketOperations.js")
const { removeCarriageReturn, countNumberCharactersInText } = require("./src/textControls")

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

  let detectedText = await removeCarriageReturn(text)

  let numberCharacters = await countNumberCharactersInText(detectedText)

  let limitNumberCharacters =
      numberCharacters > 10000
          ? res.status(400).send({ response: "The maximum number of characters is 10 000!" })
          : numberCharacters

  await deleteFile(fileName, bucketName)
  return res.status(200).send({ numberCharactersInText: limitNumberCharacters, text: detectedText })
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
