const vision = require("@google-cloud/vision")
const clientOptions = {apiEndpoint: 'eu-vision.googleapis.com'};
const client = new vision.ImageAnnotatorClient(clientOptions);

async function textDetectionFromImage(fileName, bucketName) {
  const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`)
  const [annotation] = result.textAnnotations
  return annotation ? annotation.description.trim() : ""
}

module.exports = {
  textDetectionFromImage,
}
