const {Poppler} = require("node-poppler");

async function pdfToImage(data, outputFileName) {
    const poppler = new Poppler("/usr/bin/")
    const fileOptions = {
        firstPageToConvert: 1,
        pngFile: true,
        singleFile: true
    };
    return await poppler.pdfToCairo(data, outputFileName, fileOptions);
}

module.exports = {
    pdfToImage
}