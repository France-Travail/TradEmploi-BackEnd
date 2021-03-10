import * as admin from "firebase-admin";
// import * as serviceAccount from "../../credentials/credentials.json";
import { formatTime } from "./utils";

// const params = {
//     type: serviceAccount.type,
//     projectId: serviceAccount.project_id,
//     privateKeyId: serviceAccount.private_key_id,
//     privateKey: serviceAccount.private_key,
//     clientEmail: serviceAccount.client_email,
//     clientId: serviceAccount.client_id,
//     authUri: serviceAccount.auth_uri,
//     tokenUri: serviceAccount.token_uri,
//     authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
//     clientC509CertUrl: serviceAccount.client_x509_cert_url,
// };

export const error = async (roomId: String) => {
    if (!admin.apps.length) {
        admin.initializeApp({
            // credential: admin.credential.cert(params),
            // databaseURL: serviceAccount.url,
        });
    }
    return await admin
        .firestore()
        .collection("errors")
        .orderBy("day", "desc")
        .get()
        .then((res) => {
            return buildErrors(res,roomId)
        }
    )
}

export const errorFormatted = async (roomId: String) => {
    const errors = await error(roomId)
    if(errors && errors.length > 0){
        return getErrorFormatted(errors)
    }
    return {
        day: '',
        hours: '',
        descriptions: ''
    }
}

const buildErrors = (res: any, roomId: String) => {
    return res.docs
        .filter((doc:any) => doc.data().roomId === roomId)
        .map((err: any) => buildError(err.data()))
}

const buildError = (error: any) => {
    return {
            roomId: error.roomId,
            day: error.day,
            hour: formatTime(error.hour),
            detail: {
                code: error.detail.code,
                description: error.detail.description 
            }
        }
}
const getErrorFormatted = (errors:any) => {
    const day = errors[0].day;
    const kpiError = ['501','503','500','403', '509', '408']
    const errorKpi = errors.filter((error: any) => kpiError.includes(error.detail.code))
    const descriptions = errorKpi.map((error:any) =>  error.detail.description).join(',');
    const hours = errorKpi.map((error:any) => error.hour).join(',');
    return {
        day: day,
        hours: hours,
        descriptions: descriptions
    }
}
