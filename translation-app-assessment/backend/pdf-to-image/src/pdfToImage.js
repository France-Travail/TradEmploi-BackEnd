const { Poppler } = require("node-poppler")
const fs = require("fs").promises
async function pdfToImage(data, outputFileName) {
  const poppler = new Poppler("/usr/bin/")
  const fileOptions = {
    firstPageToConvert: 1,
    pngFile: true,
    singleFile: true,
  }
  await poppler.pdfToCairo(data, outputFileName, fileOptions)
  return fs.readFile(outputFileName + ".png").then((fileBuffer) => {
    return fileBuffer.toString("base64")
  })
}

module.exports = {
  pdfToImage,
}
