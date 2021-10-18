// Copyright 2021 Google LLC. This software is provided as-is, without warranty
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
app.get('/', async (req, res) => {
  console.log("hello");
})

app.post('/', async (req, res) => {
    await kpi()
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

    await createLanguagesFromRates();
    res.status(204).send()
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})


async function kpi(){
  const roomsReference = await firestore.collection('chats')
  await roomsReference.get()
      .then((querySnapshot) => {
          createKpis(querySnapshot)
      })
  // await admin.database().ref("chats").remove()
}

const createKpis = (querySnapshot) => {
  querySnapshot.forEach(async (doc) => {
      const data = doc.data()
      const kpi = buildkpi(data, doc.id)
      if(kpi != {}){
        await kpiOnDb(kpi, doc.id)
      }
  })
}

const buildkpi = (chat, roomId) => {
  const messages = chat.messages ? getMessagesData(chat.messages) : []
  const members = getMembers(chat.members)
  const conversation =
      messages.length > 0 ? getConversation(messages, members.length) : {}
  const device = getDevice(members, chat.support)
  return messages.length > 0 ? {
      day: new Date(messages[0].date),
      roomId: roomId,
      conversation: conversation,
      device: device,
  }
  :{}
}

const getMessagesData = (elements) => {
  const element = []
  for (const prop in elements) {
      const temp = elements[prop]
      if (temp && temp.message) {
          element.push(temp.message)
      }
  }
  return element
}

const kpiOnDb = async (data, roomId) => {
  const roomsReference = await firestore.collection('kpis').doc(roomId)
  return await roomsReference.set(data)
}

const getMembers = (elements) => {
  const element = []
  for (const prop in elements) {
      const temp = elements[prop]
      if (temp) {
          element.push(temp)
      }
  }
  return element
}

const getConversation = (messages, memberTotal) => {
  return {
      begin: formatTime(messages[0].hour),
      end: formatTime(messages[messages.length - 1].hour),
      duration: getDuration(messages[messages.length - 1].hour, messages[0].hour),
      languages: getGuestLanguages(messages),
      nbUsers: memberTotal,
      translationMode: getTranslationMode(messages),
  }
}

const getDuration = (lastMessageTime, firstMessageTime) => {
  const l = lastMessageTime.split(":")
  const f = firstMessageTime.split(":")
  const nbSeconds =
    Number(l[0]) * 3600 +
    Number(l[1]) * 60 -
    (Number(f[0]) * 3600 + Number(f[1]) * 60)
  return (
    formatNumber((nbSeconds / 3600) | 0) +
    "h" +
    formatNumber(((nbSeconds % 3600) / 60) | 0)
  )
}

const getTranslationMode = (messages) => {
  const mode = [
    'Texte',
    'Voix et Texte',
    'Voix',
  ]
  let i = 1
  const textNone =
    messages.find(
      (message) => message.translationMode !== 'Texte'
    ) !== undefined
  const vocalNone =
    messages.find(
      (message) => message.translationMode !== 'Voix'
    ) !== undefined
  if (textNone) i += 1
  if (vocalNone) i -= 1
  return mode[i]
}


const getGuestLanguages = (messages) => {
  return messages
    .filter((item) => item.role === 'DE')
    .filter(
      (item, pos, arr) =>
        pos === 0 || item.languageName !== arr[pos - 1].languageName
    )
    .map((m) => m.languageName)
    .join(",")
}

const getDevice = (members, support) => {
  let guestsDevices = []
  let advisorDevice = []
  members.forEach((m) => {
      m.role === 'DE' && m.device
      ? guestsDevices.push(mapMemberToDevice(m.device))
      : advisorDevice.push(mapMemberToDevice(m.device))
  })
  return {
      support: support,
      guest: formatDevice(guestsDevices),
      advisor: formatDevice(advisorDevice),
  }
}


const formatDevice = (devices) => {
  let devicesDto = deviceToDeviceDto(devices)
  return {
    equipment: devicesDto.equipments.join(","),
    os: {
      name: devicesDto.osName.join(","),
      version: devicesDto.osVersion.join(","),
    },
    browser: {
      name: devicesDto.browserName.join(","),
      version: devicesDto.browserVersion.join(","),
    },
  }
}

const deviceToDeviceDto = (devices) => {
  let equipments = [],
    osName = [],
    osVersion = [],
    browserName = [],
    browserVersion = []
  devices.forEach((d) => {
    equipments.push(d.equipment)
    osName.push(d.os.name)
    osVersion.push(d.os.version)
    browserName.push(d.browser.name)
    browserVersion.push(d.browser.version)
  })
  return {
    equipments: equipments,
    osName: osName,
    osVersion: osVersion,
    browserName: browserName,
    browserVersion: browserVersion,
  }
}


const mapMemberToDevice = (device) => {
  return {
      equipment: device.type,
      os: {
          name: device.os,
          version: device.osVersion,
      },
      browser: {
          name: device.browser,
          version: device.browserVersion,
      },
  }
}

const formatTime = (time) => {
  const timeArray = time.split(":")
  return (
    formatNumber(Number(timeArray[0]) | 0) +
    "h" +
    formatNumber(Number(timeArray[1]) | 0)
  )
}

const formatNumber = (n) => {
  return (n < 10 ? "0" : "") + n
}

function setAverage(langaugesAverageRate, data) {
    if (data.efficientGrade) {
        const existingItem = langaugesAverageRate.get(data.language);
        if (existingItem) {
            langaugesAverageRate.set(data.language, existingItem + data.efficientGrade);
        } else {
            langaugesAverageRate.set(data.language, data.efficientGrade);
        }
    }
}

async function createLanguagesFromRates() {

    let languagesSelected = [];
    let langaugesAverageRate = new Map();
    await firestore.collection("rates").get().then((res) => {
            res.forEach((doc) => {
                const data = doc.data();
                const language = data.language + '';
                if (language) {
                    languagesSelected = languagesSelected.concat(language.split(','));
                   // setAverage(langaugesAverageRate, data);
                }
            })
        }
    )
    console.log(`Readed ${languagesSelected.length} rate documents.`);
    const mapLanguages = languagesSelected.filter(l => l).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    const languagesSorted = new Map([...mapLanguages.entries()].sort((a, b) => b[1] - a[1]));
    Array.from(languagesSorted.keys()).forEach(isoCode =>
        createLanguage(isoCode, languagesSorted.get(isoCode),langaugesAverageRate.get(isoCode)));
    console.log(`Created ${languagesSorted.size} language documents.`);
}

async function createLanguage(isoCode, occurrences, average) {
    const data = {
        isoCode: isoCode,
        occurrences: occurrences,
        average: average?average: ''
    }
    console.log(data);
    await firestore.collection("languages").doc(isoCode).set(data)
}

