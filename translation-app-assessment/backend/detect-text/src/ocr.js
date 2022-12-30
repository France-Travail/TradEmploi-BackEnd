const vision = require("@google-cloud/vision")
const client = new vision.ImageAnnotatorClient()

async function textDetectionFromImage(fileName, bucketName) {
  const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`)
  const [annotation] = result.textAnnotations
  return annotation ? annotation.description.trim() : ""
}

module.exports = {
  textDetectionFromImage,
}
