const vision = require("@google-cloud/vision")
const client = new vision.ImageAnnotatorClient()
const readFile = require("./bucketOperations.js").readFile

async function textDetectionFromPdf(fileName, bucketName) {
  const inputConfig = {
    // Supported mime_types are: 'application/pdf' and 'image/tiff'
    mimeType: "application/pdf",
    gcsSource: {
      uri: `gs://${bucketName}/${fileName}`,
    },
  }

  const outputConfig = {
    gcsDestination: {
      uri: `gs://${bucketName}/dest/`,
    },
  }

  const features = [{ type: "DOCUMENT_TEXT_DETECTION" }]
  const request = {
    requests: [
      {
        inputConfig: inputConfig,
        features: features,
        outputConfig: outputConfig,
      },
    ],
  }

  const [operation] = await client.asyncBatchAnnotateFiles(request)
  const [filesResponse] = await operation.promise()
  const destinationUri =
    filesResponse.responses[0].outputConfig.gcsDestination.uri
  console.log("destinationUri: " + destinationUri)
  const result = await readFile(bucketName, fileName)
  return JSON.parse(result).responses[0].fullTextAnnotation.text
}

async function textDetectionFromImage(fileName, bucketName) {
  const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`)
  const [annotation] = result.textAnnotations

  const text = annotation ? annotation.description.trim() : ""
  console.log("Extracted text from image:", text)
  return text
}
module.exports = {
  textDetectionFromPdf,
  textDetectionFromImage,
}
