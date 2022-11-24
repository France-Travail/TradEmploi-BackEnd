"use strict";

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.disable("x-powered-by");
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());

app.post("/", async (req, res) => {
    const {bucketName, data, fileName} = req.body;

    await uploadFileToBucket(fileName, bucketName, data);
    let text = '';
    if (fileName && fileName.endsWith('.pdf')) {
        text = await textDetectionFromPdf(fileName, bucketName);
    } else {
        text = await textDetectionFromImage(fileName, bucketName);
    }

    await deleteFile(fileName, bucketName);

    return res.status(200).send(text);
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

async function deleteFile(fileName, bucketName) {

    await storage.bucket(bucketName).file(fileName).delete();

    console.log(`gs://${bucketName}/${fileName} deleted`);
}

async function textDetectionFromImage(fileName, bucketName) {
    const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`);
    const [annotation] = result.textAnnotations;

    const text = annotation ? annotation.description.trim() : '';
    console.log('Extracted text from image:', text);
    return text;
}

async function textDetectionFromPdf(fileName, bucketName) {

    const inputConfig = {
        // Supported mime_types are: 'application/pdf' and 'image/tiff'
        mimeType: 'application/pdf',
        gcsSource: {
            uri: `gs://${bucketName}/${fileName}`,
        },
    };

    const outputConfig = {
        gcsDestination: {
            uri: `gs://${bucketName}/dest/`,
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
    const [filesResponse] = await operation.promise();
    const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
    console.log('destinationUri: ' + destinationUri);
    const result = await readFile(bucketName, fileName);
    return JSON.parse(result).responses[0].fullTextAnnotation.text;
}

async function readFile(bucketName, fileName) {
    const remoteFile = storage.bucket(bucketName).file(`dest/output-1-to-1.json`);

    return new Promise(function (resolve, reject) {
        var archivo = remoteFile.createReadStream();

        var buf = '';
        archivo.on('data', function (d) {
            buf += d;
        }).on('end', function () {
            resolve(buf);
        }).on('error', reject);
    })
}

async function uploadFileToBucket(fileName, bucketName, data) {
    const [bucketExist] = await storage.bucket(bucketName).exists();
    if (!bucketExist) {
        await storage.createBucket(bucketName);
    }

    const file = storage.bucket(bucketName).file(fileName);

    const fileOptions = {
        resumable: false,
        validation: false
    };

    if (typeof data === 'string') {
        const base64EncodedString = data.replace(/^data:\w+\/\w+;base64,/, '');
        const fileBuffer = Buffer.from(base64EncodedString, 'base64');
        console.log('save');
        await file.save(fileBuffer, fileOptions);
    }

    console.log(`${fileName} uploaded.`);
}