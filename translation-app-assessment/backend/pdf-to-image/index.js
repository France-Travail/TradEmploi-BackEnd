const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const { encodePdf } = require("./src/encodePdf")
const { pdfToImage } = require("./src/pdfToImage")
const { deleteFile } = require("./src/deleteFile")

const app = express()
app.disable("x-powered-by")
app.use(bodyParser.json({ limit: "10mb" }))

const corsOptions = {
  methods: ["POST"],
  maxAge: 3600,
}

app.use(cors(corsOptions))

app.post("/", async (req, res) => {
  const { fileName, data } = req.body

  let fileBuffer = await encodePdf(data)

  const outputFileName = `${fileName.split(".")[0]}`
  let convertedFile = await pdfToImage(fileBuffer, outputFileName)
  if (!fileBuffer || !convertedFile) {
    return res.send({ error: "Le fichier n'a pas pu être converti !" })
  }

  res.send({
    data: convertedFile,
  })
})

const port = process.env.PORT || 8080

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
