import axios from "axios"
import qs from "qs";
import { accessTokenResponse } from "../models/accessTokenResponse";
import { callBackResponse } from "../models/callBackResponse"
require('dotenv').config()

process.env.NODE_ENV !== "production" ? process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0' : ""

export const getAccessToken = async (callBackResponse:callBackResponse):Promise<accessTokenResponse|void>  => {
  const data = {
    code: callBackResponse.code,
    client_id: callBackResponse.client_id,
    redirect_uri: process.env.REDIRECT_URI ?? "",
    client_secret: process.env.CLIENT_SECRET ?? "",
    grant_type: "authorization_code",
  };
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  return axios
    .post(process.env.ACCESS_TOKEN_URL ?? "", qs.stringify(data), config)
    .then((response) => {
      return response.data as unknown as accessTokenResponse;
    })
    .catch(function (error) {
      console.log(error);
    });
}
