// Copyright 2021 Google LLC. This software is provided as-is, without warranty
// or representation for any use or purpose. Your use of it is subject to your
// agreement with Google.

'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const Moment = require('moment')
const firebaseAdmin = require('firebase-admin')
const {IAMCredentialsClient} = require('@google-cloud/iam-credentials')
const helmet = require('helmet')
const jwt = require('jsonwebtoken');
const sha1 = require('sha1')
const crypto = require('crypto');
require('dotenv').config({ path: require('find-config')('.env') })

// Init express.js app
const app = express()
app.use(bodyParser.json())
app.disable('x-powered-by')

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,  // Permet les requêtes incluant les cookies
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};


app.use(helmet());
app.use(cors(corsOptions));

// Init project and services
const projectId = process.env.GCP_PROJECT
firebaseAdmin.initializeApp();
const firestore = firebaseAdmin.firestore()

// Init IAM creadentials client
const client = new IAMCredentialsClient()

const scopes = [
  'https://www.googleapis.com/auth/cloud-platform'
]

const serviceAccounts = {
  anonymous: `trad-client-guest@${projectId}.iam.gserviceaccount.com`,
  authenticated: `trad-client-admin@${projectId}.iam.gserviceaccount.com`
}

const apiGatewayAudience = process.env.API_GATEWAY_AUDIENCE

async function generateGcpToken(expiryDate, targetServiceAccount) {
  const currentDate = new Moment()
  const lifetimeSeconds = expiryDate.diff(currentDate, 'seconds')
  const token = await client.generateAccessToken({
    name: `projects/-/serviceAccounts/${targetServiceAccount}`,
    scope: [scopes],
    lifetime: {
      seconds: lifetimeSeconds
    }
  })
  console.log('token granted until', new Moment(currentDate).add(lifetimeSeconds, 'seconds').toISOString())
  return token
}

async function generateApiGatewayToken(endpoint, expiryDate, targetServiceAccount) {
  // Sign a jwt token with the service account this is running as,
  // for the service account we want as the target
  const expiryTimestamp = Math.floor(expiryDate.format('X'))
  const iat = Math.floor(new Date() / 1000)
  const payloadContent = {
    iss: targetServiceAccount,
    sub: targetServiceAccount,
    aud: endpoint,
    iat: iat,
    exp: expiryTimestamp
  }

  const tokenResponse = await client.signJwt({
    name: `projects/-/serviceAccounts/${targetServiceAccount}`,
    payload: JSON.stringify(payloadContent)
  })

  return {endpoint: endpoint, token: tokenResponse[0].signedJwt, expireTime: expiryTimestamp}
}

async function getExpiryFromRoom(roomId, userId) {
  console.log(`Checking room ${roomId} as this is an anonymous user`)
  const roomReference = await firestore.collection('chats').doc(roomId)
  const room = await roomReference.get()
  let expiryDate
  let guests
  let authorized = true

  // We only want to do anything if the room exists (created by an admin)
  if (room.exists) {
    const roomData = room.data()
    expiryDate = roomData && roomData.expiryDate && new Moment(roomData.expiryDate)
    guests = roomData && roomData.guests

    // Log and return on the various error scenarios:
    // Fail if this is the wrong guest for this room
    const hasGuest = guests.find(g => g.id === userId && g.status)
    if (!hasGuest) {
      authorized = false
      console.log('Not authorized: user is not the guest in this room')
    }
    // Fail if room expiry date hasn't been set
    if (!expiryDate) {
      authorized = false
      console.log("Not authorized: room doesn't have an expiry date")
    }
    // Fail if room is expired
    if (new Moment() >= expiryDate) {
      authorized = false
      console.log('Not authorized: room has expired')
    }
  } else {
    authorized = false
    console.log("Not authorized: room doesn't exist")
  }
  // make sure expiryDate doesn't go beyond 1 hour from now
  const anHourFromNow = new Moment().add(1, 'hour')

  if (expiryDate > anHourFromNow) {
    expiryDate = anHourFromNow
  }
  return authorized && expiryDate
}

app.post('/', async (req, res, next) => {
  try {
    // First, verify the Firebase token.
    // Authorization token will come as x-forwarded-authorization if invoking
    // behind API Gateway, so take that case into account.
    const tokenPayload = req.headers['x-forwarded-authorization'] || req.headers.authorization
    const firebaseToken = tokenPayload ? tokenPayload.split('Bearer ')[1] : null
    // Générez le token CSRF JWT
    // const csrfToken = jwt.sign({ csrf: true }, process.env.CSRF_SECRET_KEY, { expiresIn: '1h' });

    if (!firebaseToken) {
      res.status(401).send('Authentication required')
      return
    }

    let firebaseVerification
    try {
      firebaseVerification = await firebaseAdmin.auth().verifyIdToken(firebaseToken)
    } catch (err) {
      console.log('error verifying with Firebase:', err.code, err.message)
      res.status(403).send('Authentication failed')
      return
    }

    // Next determine if this is an admin user or a guest
    const userId = firebaseVerification.sub
    const authProvider = firebaseVerification.firebase.sign_in_provider === 'anonymous' ? 'anonymous' : 'authenticated'
    const targetServiceAccount = serviceAccounts[authProvider]
    console.log('logged in user:', sha1(userId), 'auth provider:', authProvider)

    // If this user is anonymous we also need to check the chat room and get or set the expiry date
    let expiryDate
    if (authProvider === 'anonymous') {
      if (!req.body.roomId) {
        res.send(400, 'Room ID is missing')
        return
      }
      if (req.body.firstname) {
        await addGuest(req.body.roomId, userId, req.body.firstname)
        res.send(200, "GuestId added")
        return
      } else {
        expiryDate = await getExpiryFromRoom(req.body.roomId, userId)
      }
    } else {
      // admin expiry defaults to 1 hour from current time
      expiryDate = new Moment().add(1, 'hours')
    }

    // fail if we don't have an expiry date (e.g. room doesn't exist or has expired if this is a guest)
    if (!expiryDate) {
      console.log('guest access denied')
      res.status(403).send("You're not allowed in this room")
      return
    }

    // finally generate and return the token
    const gcpTokenPromise = generateGcpToken(expiryDate, targetServiceAccount)
    const apiGatewayTokenPromise = generateApiGatewayToken(apiGatewayAudience, expiryDate, targetServiceAccount)
    const [gcpToken, apiGatewayToken] = await Promise.all([gcpTokenPromise, apiGatewayTokenPromise])
    const response = {
      gcp: {
        token: gcpToken[0].accessToken,
        expireTime: gcpToken[0].expireTime
      },
      apiGateway: apiGatewayToken,
    }
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    })
    res.send(response)
  } catch (e) {
    next(e)
  }
})

app.use(function (err, req, res, /*unused*/ next) {
  console.error(err)
  res.status(500)
  res.send({ error: err })
})

async function addGuest(roomId, userId, firstname) {
  const roomReference = await firestore.collection('chats').doc(roomId);
  const FieldValue = firebaseAdmin.firestore.FieldValue;
  await roomReference.update({
    guests: FieldValue.arrayUnion({id: userId, status: false, firstname: firstname})
  })
}

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
