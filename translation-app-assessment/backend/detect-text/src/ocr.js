const vision = require("@google-cloud/vision")
const client = new vision.ImageAnnotatorClient()
const {readFile, deleteFile} = require("./bucketOperations.js")

async function textDetectionFromPdf(fileName, bucketName) {
    const inputConfig = {
        mimeType: 'application/pdf',
        gcsSource: {
            uri: `gs://${bucketName}/${fileName}`,
        },
    };


    const outputConfig = {
        gcsDestination: {
            uri: `gs://${bucketName}/`,
        },
    };

    const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
    const request = {
        requests: [
            {
                inputConfig: inputConfig,
                features: features,
                outputConfig: outputConfig
            },
        ],
    };

    const [operation] = await client.asyncBatchAnnotateFiles(request);
    await operation.promise();
    const outputFile = 'output-1-to-1.json';
    const result = await readFile(bucketName, outputFile);
    deleteFile(outputFile, bucketName);
    return JSON.parse(result).responses[0].fullTextAnnotation.text;
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
