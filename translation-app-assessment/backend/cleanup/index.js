// Copyright 2021 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const Moment = require('moment')
const firebaseAdmin = require('firebase-admin')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const secretManagerServiceClient = new SecretManagerServiceClient();
const Monitoring = require('@google-cloud/monitoring')
// Init express.js app
const app = express()
app.use(bodyParser.json())
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.disable('x-powered-by')
require('dotenv');
const cors = require('cors');

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,  // Permet les requêtes incluant les cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));
// Init project and services
const projectId = process.env.GCP_PROJECT

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
                namespace: 'traduction',
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
app.get('/', async (_req, _res) => {
    console.log(`⚡️[server]: cleanup server is running on port ${port}`)
})

app.post('/', async (req, res, next) => {
    try {

        // Call initializeFirebase during startup
        await initializeFirebase();

        await kpi()
        // Delete chat that have been expired for an hour or longer
        const deletionPromises = []
        const collection = firebaseAdmin.firestore().collection('chats')
        const deletionTimeThreshold = parseInt(Moment().subtract(1, 'hour').format('x'))
        const querySnapshot = await collection.where('expiryDate', '<', deletionTimeThreshold).get()
        for (const docSnapshot of querySnapshot.docs) {
            deletionPromises.push(collection.doc(docSnapshot.id).delete())
        }
        await Promise.all(deletionPromises)
        if (process.env.ID_BOT !== undefined) await cleanRatesFromBot();
        await writeMonitoring()
        console.log(`deleted chats, size:${querySnapshot.size}`)

        await createLanguagesFromRates();
        await deleteInactiveUsers();
        res.status(204).send()
    } catch (e) {
        next(e)
    }
})

app.use(function (err, req, res, _next) {
    console.error(err)
    res.status(500)
    res.send({ error: err })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

async function cleanRatesFromBot() {
    // Delete rates created by the end to end tests robot process.env.ID_BOT
    const deletionPromises = []
    const collection = firebaseAdmin.firestore().collection('rates')
    const querySnapshot = await collection.where('user', '=', `${process.env.ID_BOT}`).get()
    for (const docSnapshot of querySnapshot.docs) {
        deletionPromises.push(collection.doc(docSnapshot.id).delete())
    }
    console.log(`rates deleted, size:${deletionPromises.length},user: ${process.env.ID_BOT}`);
    await Promise.all(deletionPromises)
}

async function kpi() {
    const roomsReference = await firebaseAdmin.firestore().collection('chats')
    await roomsReference.get()
        .then((querySnapshot) => {
            createKpis(querySnapshot)
        })
    // await admin.database().ref("chats").remove()
}

const createKpis = (querySnapshot) => {
    querySnapshot.forEach(async (doc) => {
        const data = doc.data()
        const result = buildkpi(data, doc.id)
        if (result !== {}) {
            await kpiOnDb(result, doc.id)
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
        : {}
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
    const roomsReference = await firebaseAdmin.firestore().collection('kpis').doc(roomId)
    return roomsReference.set(data)
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
    return `${formatNumber((nbSeconds / 3600) | 0)}h${formatNumber(((nbSeconds % 3600) / 60) | 0)}`
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
    if (textNone) {
        i += 1
    }
    if (vocalNone) {
        i -= 1
    }
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
    const guestsDevices = []
    const advisorDevice = []
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
    const devicesDto = deviceToDeviceDto(devices)
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
    const equipments = [],
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
    return `${formatNumber(Number(timeArray[0]) | 0)}h${formatNumber(Number(timeArray[1]) | 0)}`
}

const formatNumber = (n) => {
    return (n < 10 ? "0" : "") + n
}


async function createLanguagesFromRates() {

    let languagesSelected = [];
    const langaugesAverageRate = new Map();
    await firebaseAdmin.firestore().collection("rates").get().then((res) => {
            res.forEach((doc) => {
                const data = doc.data();
                const language = data.language + '';
                const user = data.user + '';
                const excludedUsers = [process.env.ID_BOT];
                if (language && !excludedUsers.includes(user)) {
                    languagesSelected = languagesSelected.concat(language.split(','));
                    if (data.grades && data.grades.length > 0) {
                        const grade = data.grades[0];
                        const existingItem = langaugesAverageRate.get(language);
                        if (existingItem) {
                            langaugesAverageRate.set(language, existingItem + grade);
                        } else {
                            langaugesAverageRate.set(language, grade);
                        }
                    }
                }
            })
        }
    )
    const mapLanguages = languagesSelected.filter(l => l).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    const languagesSorted = new Map([...mapLanguages.entries()].sort((a, b) => b[1] - a[1]));
    Array.from(languagesSorted.keys()).forEach(isoCode => {
        createLanguage(isoCode, languagesSorted.get(isoCode), langaugesAverageRate.get(isoCode));
    });
    console.log(`language documents created, size: ${languagesSorted.size}`);
}

async function createLanguage(isoCode, occurrences, average) {
    const data = {
        isoCode: isoCode,
        occurrences: occurrences,
        average: (average && occurrences) ? (average / occurrences) : ''
    }
    await firebaseAdmin.firestore().collection("languages").doc(isoCode).set(data)
}

async function deleteInactiveUsers() {

    const auth = firebaseAdmin.auth();

    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    try {
        let usersDeleted = 0;
        let nextPageToken = '';

        do {
            const result = await auth.listUsers(1000, nextPageToken);
            const inactiveUsers = result.users.filter(user => {
                const lastSignInTime = user.metadata.lastSignInTime;
                return lastSignInTime && new Date(lastSignInTime).getTime() < oneYearAgo;
            });

            const deletionPromises = inactiveUsers.map(user => {
                return auth.deleteUser(user.uid)
                  .then(() => {
                      console.log(`Successfully deleted user: ${user.uid}`);
                      usersDeleted++;
                  })
                  .catch(error => {
                      if (error.code === 'auth/too-many-requests') {
                          console.error(`Quota exceeded while deleting user ${user.uid}. Retrying after delay...`);
                          // Retrying mechanism can be implemented here if needed
                      } else if (error.code === 'auth/user-not-found') {
                          console.error(`User ${user.uid} not found.`);
                      } else {
                          console.error(`Error deleting user ${user.uid}:`, error.message);
                      }
                  });
            });

            await Promise.all(deletionPromises);

            nextPageToken = result.pageToken;
        } while (nextPageToken);

        console.log(`Deleted ${usersDeleted} inactive users.`);
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

// Function to initialize Firebase
async function initializeFirebase() {
    try {
        const [version] = await secretManagerServiceClient.accessSecretVersion({
            name: `projects/${projectId}/secrets/firebase-config/versions/latest`,
        });

        // Extract the secret payload as a string
        const payload = version.payload.data.toString('utf8');

        // Initialize Firebase Admin SDK
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(JSON.parse(payload)),
        });

        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}
