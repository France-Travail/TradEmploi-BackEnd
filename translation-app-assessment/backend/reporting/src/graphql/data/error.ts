import * as admin from "firebase-admin";
import {formatTime} from "./utils";


export const error = async (roomId: string) => {
    if (!admin.apps.length) {
        admin.initializeApp({});
    }
    return admin
        .firestore()
        .collection("errors")
        .where("roomId", "==", roomId)
        .orderBy("day", "desc")
        .get()
        .then((res) => {
                return buildErrors(res, roomId)
            }
        )
}

export const errorFormatted = async (roomId: string) => {
    const errors = await error(roomId)
    if (errors && errors.length > 0) {
        return getErrorFormatted(errors)
    }
    return {
        day: '',
        hours: '',
        descriptions: ''
    }
}

const buildErrors = (res: any, roomId: string) => {
    return res.docs
        .filter((doc: any) => doc.data().roomId === roomId)
        .map((err: any) => buildError(err.data()))
}

const buildError = (err: any) => {
    return {
        roomId: err.roomId,
        day: err.day,
        hour: formatTime(err.hour),
        detail: {
            code: err.detail.code,
            description: err.detail.description
        }
    }
}
const getErrorFormatted = (errors: any) => {
    const day = errors[0].day;
    const kpiError = ['501', '503', '500', '403', '509', '408']
    const errorKpi = errors.filter((err: any) => kpiError.includes(err.detail.code))
    const descriptions = errorKpi.map((err: any) => err.detail.description).join(',');
    const hours = errorKpi.map((err: any) => err.hour).join(',');
    return {
        day: day ? day : '',
        hours: hours ? hours : '',
        descriptions: descriptions ? descriptions : ''
    }
}
