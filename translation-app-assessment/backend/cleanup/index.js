// Copyright 2020 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const Moment = require('moment')
const firebaseAdmin = require('firebase-admin')
const Monitoring = require('@google-cloud/monitoring')

// Init express.js app
const app = express()
app.use(bodyParser.json())
app.disable('x-powered-by')

// Init project and services
const projectId = process.env.GCP_PROJECT
firebaseAdmin.initializeApp()
const firestore = firebaseAdmin.firestore()

// Function to write monitoring "heartbeat" that cleanup has run
const writeMonitoring = async () => {
  const monitoringOptions = {
    projectId: projectId
  }
  const monitoring = new Monitoring.MetricServiceClient(monitoringOptions)

  const dataPoint = {
    interval: {
      endTime: {
        seconds: Moment().format('X')
      }
    },
    value: {
      int64Value: 1
    }
  }

  const timeSeriesData = {
    metric: {
      type: 'custom.googleapis.com/cleanup_heartbeat'
    },
    resource: {
      type: 'generic_task',
      labels: {
        project_id: projectId,
        task_id: 'cleanup',
        location: process.env.LOCATION || 'global',
        namespace: 'pole-emploi',
        job: 'cleanup'
      }
    },
    points: [dataPoint]
  }

  const request = {
    name: monitoring.projectPath(projectId),
    timeSeries: [timeSeriesData]
  }
  return monitoring.createTimeSeries(request)
}

app.post('/', async (req, res) => {
  // Delete chat that have been expired for an hour or longer
  const deletionPromises = []
  const collection = firestore.collection('chats')
  const deletionTimeThreshold = parseInt(Moment().subtract(1, 'hour').format('x'))
  const querySnapshot = await collection.where('expiryDate', '<', deletionTimeThreshold).get()
  for (const docSnapshot of querySnapshot.docs) {
    deletionPromises.push(collection.doc(docSnapshot.id).delete())
  }
  await Promise.all(deletionPromises)
  await writeMonitoring()
  console.log(`Deleted ${querySnapshot.size} documents.`)
  res.status(204).send()
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
