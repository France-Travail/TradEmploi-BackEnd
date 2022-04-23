import express, { Express, Request, Response } from "express"
import { accessTokenResponse } from "./models/accessTokenResponse"
import { callBackResponse } from "./models/callBackResponse"
import { userInfosResponse } from "./models/userInfosResponse"
import { getAccessToken } from "./utils/getAccessToken"
import { getUserInfo } from "./utils/getUserInfo"
require("dotenv").config()
const app: Express = express()
const port = 8080 


app.get("/callback", async (req: Request, res: Response) => {
  const query: callBackResponse = req.query as unknown as callBackResponse
  const codeResp: callBackResponse = query
  const accessToken: accessTokenResponse | void = await getAccessToken(codeResp)
  if (accessToken) {
    const userInfos = (await getUserInfo(
      accessToken
    )) as unknown as userInfosResponse
    res.redirect(
      302,
      `${process.env.REDIRECT_URI_FRONT}?name=${userInfos.name}&family_name=${userInfos.family_name}&email=${userInfos.email}&sub=${userInfos.sub}&state=${query.state}`
    )
  } else {
    res.status(501).send("Internal error")
  }
})

app.listen(port, () => {
  console.log(`⚡️[server]: Auth server is running`)
})
