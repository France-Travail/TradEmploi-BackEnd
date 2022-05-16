import axios from "axios"

import {UserInfosResponse} from "../models/userInfosResponse";

require('dotenv').config()

export const getUserInfo = async (accessToken: string) => {

  const config = {
    headers: {
      "Authorization": "Bearer " + accessToken,
    },
  };
  return axios
      .post(process.env.USER_INFO_URL ?? "", null, config)
      .then((response) => {
        return response.data as unknown as UserInfosResponse;
      })
      .catch(function (error) {
        console.error(error);
      });
}
