// import * as serviceAccount from "../credentials/credentials.json";
import {rates, rate} from './data/rates';
import { getKpi } from "./data/kpi";
import { error, errorFormatted } from "./data/error";
import {languages} from "./data/languages";

const resolverFunctions = {
  Query: {
    rates: async (_parent:any, _args:any, context: any) => {
      return isConnected(context) ? await rates() : null
    },
    rate: async (_parent:any, languageArg: String, context: any) => {
      const json = JSON.stringify(languageArg)
      const data = JSON.parse(json)
      return isConnected(context) ? await rate(data.language) : null
    },
    kpi: async (_parent:any, _args:any, context: any) => {
      return isConnected(context) ? await getKpi() : null
    },
    languages: async (_parent:any, _args:any) => {
      return  await languages()
    },
    error: async (_parent:any, roomIdArg:any, context: any) => {
      const json = JSON.stringify(roomIdArg)
      const data = JSON.parse(json)
      return isConnected(context) ? await error(data.roomId) : null
    }
  },
  Kpi: {
    async error(parent: any){
      return await errorFormatted(parent.roomId)
    }
  },
  Mutation: {
    login: (_: any,key: String) => {
        const json = JSON.stringify(key)
        const login = JSON.parse(json)
        const hasUser = true // !! // TODO // serviceAccount.key === login.key
        if (hasUser) return Buffer.from(login.key).toString('base64');
    }
  }
};

const isConnected = (context:any) => {
  const key = context && context.user ? context.user.key : null;
  return key && true // !! // TODO // key === serviceAccount.key;
}
export default resolverFunctions;
