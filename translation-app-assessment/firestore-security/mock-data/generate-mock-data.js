// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const firebaseAdmin = require('firebase-admin')
const fs = require('fs').promises

// Make sure this can't run on just any project
const authorized_projects = [
  'aiestaran-pe-tests-1'
]

// Init project and services
const projectId = process.env.GCP_PROJECT

if (!authorized_projects.includes(projectId)) {
  throw new Error("This project is not allowlisted for this script to run on. Remember this script WIPES ALL DATA in your Firestore instance. It's recommended to make a backup before you try this script. Once you're ready, you can add your project name to the authorized_projects array above and try again.")
}

const wipeData = async () => {
  // Delete all data
  const collectionReferences = await firestore.listCollections()
  const deletionPromises = []
  for (const collectionReference of collectionReferences)  {
    console.log('Deleting from collection:', collectionReference.path)
    const documentReferences = await collectionReference.listDocuments()
    for (const documentReference of documentReferences) {
      deletionPromises.push(documentReference.delete())
    }
  }
  return Promise.all(deletionPromises)
}

const populateData = async () => {
  // Read mock data and insert all
  const dataFolder = './collections/';
  const fileList = await fs.readdir(dataFolder)
  const documentPromises = []
  for (const filename of fileList) {
    const collectionName = filename.split('.json')[0]
    console.log('Populating collection', collectionName)

    const filePath = dataFolder + filename
    const fileContent = await fs.readFile(filePath, 'utf8')
    const collectionObj = JSON.parse(fileContent)
    for (const key of Object.keys(collectionObj)) {
      let documentRef = firestore.doc(collectionName + '/' + key)
      documentPromises.push(documentRef.set(collectionObj[key]))
    }
  }
  return Promise.all(documentPromises)
}

firebaseAdmin.initializeApp()
const firestore = firebaseAdmin.firestore()

// Finish
wipeData().then(() => {
  console.log('Data wiped, now populating new mock data.')
  populateData().then(() => {
    console.log('All done!')
  })
})