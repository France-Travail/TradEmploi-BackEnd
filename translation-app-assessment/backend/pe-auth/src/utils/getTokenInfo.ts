import axios from "axios"
require('dotenv').config()
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0' 

export const getTokenInfo = async (accessToken:string) => {
  const config = {
    headers: {
      "Authorization": "Bearer "+accessToken,
    },
  };
  return axios
    .get(process.env.TOKEN_INFO_URL ?? "",  config)
    .then((response) => {
        return response.data; 
    })
    .catch(function () {
      return "The access token provided is expired, revoked, malformed, or invalid for other reasons."
    });
}

export const isTokenValid = (expiration:number, clientId:string) => {
    return expiration > 0 && clientId === process.env.CLIENT_ID
}
