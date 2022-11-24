const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { textDetectionFromImage, textDetectionFromPdf } = require("./src/ocr.js")
const {
  uploadFileToBucket,
  deleteFile,
} = require("./src/bucketOperations.js")

const app = express()
app.disable("x-powered-by")
app.use(bodyParser.json({ limit: "50mb" }))
app.use(cors())

const port = process.env.PORT || 8080

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.post("/upload", async (req, res) => {
  const { bucketName, data, fileName } = req.body

  await uploadFileToBucket(fileName, bucketName, data)
  let text =
    fileName && fileName.endsWith(".pdf")
      ? await textDetectionFromPdf(fileName, bucketName)
      : await textDetectionFromImage(fileName, bucketName)

  await deleteFile(fileName, bucketName)

  return res.status(200).send({ text: text })
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
