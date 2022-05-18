import express, { Express, Request, Response } from "express"
import { accessTokenResponse } from "./models/accessTokenResponse"
import { callBackResponse } from "./models/callBackResponse"
import { getAccessToken } from "./utils/getAccessToken"
import { getTokenInfo, isTokenValid } from "./utils/getTokenInfo"
import { getUserInfo } from "./utils/getUserInfo"
require("dotenv").config()
const cors = require("cors")
const app: Express = express()
const port = 8080

// CORS options
const corsOptions = {
  origin: /https:\/\/[a-z0-9\-.]*pole-emploi[a-z0-9\-.]+/,
  methods: ["GET", "POST"],
  maxAge: 3600,
}
app.use(cors(corsOptions))
app.disable("x-powered-by")

app.get("/callback", async (req: Request, res: Response) => {
  const host = req.get("host")
  console.log(host)
  const redirectFront =
    host === process.env.HOST_ETAB
      ? process.env.REDIRECT_URI_FRONT_ETAB
      : process.env.REDIRECT_URI_FRONT
  const codeResp: callBackResponse = req.query as unknown as callBackResponse
  const accessToken: accessTokenResponse | void = await getAccessToken(codeResp)
  if (accessToken) {
    res.redirect(
      302,
      `${redirectFront}?access_token=${accessToken.access_token}&state=${codeResp.state}`
    )
  } else {
    res.status(501).send("Internal error")
  }
})

app.get("/tokeninfo", async (req: Request, res: Response) => {
  const accessToken: string = req.query.access_token as unknown as string
  const tokenInfo = await getTokenInfo(accessToken)
  if (isTokenValid(tokenInfo.expires_in, tokenInfo.client_id)) {
    const userInfos = await getUserInfo(accessToken)
    res.send(userInfos)
  } else {
    res.send(
      "The access token provided is expired, revoked, malformed, or invalid for other reasons."
    )
  }
})

app.listen(port, () => {
  console.log(`⚡️[server]: Auth server is running on port ${port}`)
})
