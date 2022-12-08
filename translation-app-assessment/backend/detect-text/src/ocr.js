const vision = require("@google-cloud/vision")
const client = new vision.ImageAnnotatorClient()
const { readFile, deleteFile } = require("./bucketOperations.js")

async function textDetectionFromPdf(fileName, bucketName) {
  const source = `gs://${bucketName}/${fileName}`
  const outputFile = "output-1-to-1.json"

  const request = {
    requests: [
      {
        inputConfig: {
          mimeType: "application/pdf",
          gcsSource: {
            uri: source,
          },
        },
        outputConfig: {
          gcsDestination: {
            uri: `gs://${bucketName}/`,
          },
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      },
    ],
  }
  const [operation] = await client.asyncBatchAnnotateFiles(request)
  await operation.promise()
  const res = await readFile(bucketName, outputFile)
  await deleteFile(outputFile, bucketName)
  return res.responses[0].fullTextAnnotation.text
}

async function textDetectionFromImage(fileName, bucketName) {
  const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`)
  const [annotation] = result.textAnnotations
  const text = annotation ? annotation.description.trim() : ""
  await deleteFile(fileName, bucketName)
  return text
}

module.exports = {
  textDetectionFromPdf,
  textDetectionFromImage,
}
