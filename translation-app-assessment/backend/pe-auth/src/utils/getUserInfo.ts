import axios from "axios"
import { accessTokenResponse } from "../models/accessTokenResponse";
import { userInfosResponse } from "../models/userInfosResponse";
require('dotenv').config()
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0' : ""

export const getUserInfo = async (accessTokenResponse:accessTokenResponse) => {
  
  const config = {
    headers: {
      "Authorization": "Bearer "+accessTokenResponse.access_token,
    },
  };
  return axios
    .post(process.env.USER_INFO_URL ?? "", null, config)
    .then((response) => {
      return response.data as unknown as userInfosResponse;
    })
    .catch(function (error) {
      console.error(error);
    });
}




