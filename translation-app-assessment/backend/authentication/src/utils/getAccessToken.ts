import axios from "axios";
import qs from "qs";
import {AccessTokenResponse} from "../models/accessTokenResponse";
import {CallBackResponse} from "../models/callBackResponse";

require('dotenv').config()

export const getAccessToken = async (response: CallBackResponse): Promise<AccessTokenResponse | void> => {
  const data = {
    code: response.code,
    client_id: response.client_id,
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
      .then((resp) => {
        return resp.data as unknown as AccessTokenResponse;
      })
      .catch(function (error) {
        console.log(error);
      });
}
