const { Storage } = require("@google-cloud/storage")
const storage = new Storage()

async function uploadFileToBucket(fileName, bucketName, data) {
  const [bucketExist] = await storage.bucket(bucketName).exists()
  if (!bucketExist) {
    await storage.createBucket(bucketName)
  }

  const file = storage.bucket(bucketName).file(fileName)

  const fileOptions = {
    resumable: false,
    validation: false,
  }

  if (typeof data === "string") {
    const base64EncodedString = data.replace(/^data:\w+\/\w+;base64,/, "")
    const fileBuffer = Buffer.from(base64EncodedString, "base64")
    await file.save(fileBuffer, fileOptions)
  }

  console.log(`${fileName} uploaded.`)
}

async function deleteFile(fileName, bucketName) {
  await storage.bucket(bucketName).file(fileName).delete()
  console.log(`${fileName} deleted.`)
}

module.exports = {
  uploadFileToBucket,
  deleteFile,
}
