import * as admin from "firebase-admin"

export const languages = async () => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return admin
        .firestore()
        .collection("languages")
        .orderBy("occurrences", "desc")
        .get()
        .then((res) => {
            return buildLanguage(res);
        })
}

const buildLanguage = (res: any) => {
    const result = [{}]
    res.forEach((doc: any) => {
        const language = doc.data()
        result.push(language)
    })
    return result.splice(1)
}

