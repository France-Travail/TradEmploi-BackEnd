import {rate, rates} from './data/rates';
import {getKpi} from "./data/kpi";
import {error, errorFormatted} from "./data/error";
import {languages} from "./data/languages";

const resolverFunctions = {
    Query: {
        rates: async (_parent: any, _args: any, context: any) => {
            return isConnected(context) ? rates() : null
        },
        rate: async (_parent: any, languageArg: string, context: any) => {
            const json = JSON.stringify(languageArg)
            const data = JSON.parse(json)
            return isConnected(context) ? rate(data.language) : null
        },
        kpi: async (_parent: any, _args: any, context: any) => {
            return isConnected(context) ? getKpi() : null
        },
        languages: async (_parent: any, _args: any) => {
            return languages()
        },
        error: async (_parent: any, roomIdArg: any, context: any) => {
            const json = JSON.stringify(roomIdArg)
            const data = JSON.parse(json)
            return isConnected(context) ? error(data.roomId) : null
        }
    },
    Kpi: {
        async error(parent: any) {
            return errorFormatted(parent.roomId)
        }
    },
    Mutation: {
        login: (_: any, key: string) => {
            const json = JSON.stringify(key)
            const login = JSON.parse(json),
            return Buffer.from(login.key).toString('base64');
        }
    }
};

const isConnected = (context: any) => {
    return context && context.user ? context.user.key : null;
}
export default resolverFunctions;
