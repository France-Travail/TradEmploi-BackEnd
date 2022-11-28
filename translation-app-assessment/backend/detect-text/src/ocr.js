const vision = require("@google-cloud/vision")
const client = new vision.ImageAnnotatorClient()
const readFile = require("./bucketOperations.js").readFile

async function textDetectionFromPdf(fileName, bucketName) {
  const result = await readFile(bucketName, fileName)
  return JSON.parse(result).responses[0].fullTextAnnotation.text
}

async function textDetectionFromImage(fileName, bucketName) {
  const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`)
  const [annotation] = result.textAnnotations
  const text = annotation ? annotation.description.trim() : ""
  return text
}
module.exports = {
  textDetectionFromPdf,
  textDetectionFromImage,
}
