import {https} from 'firebase-functions';
import { launchCron } from './graphql/data/kpi';
import gqlServer from './graphql/server';
import {launchCronForLanguages} from "./graphql/data/languages";


const server = gqlServer();

const api = https.onRequest(server);

launchCron().then(_=> console.log("kpi created")).catch(err=> console.log("An error has occured by ",err))
launchCronForLanguages().then(_=> console.log("languages created")).catch(err=> console.log("An error has occured by ",err))
export {api};
