import * as admin from "firebase-admin"

export const languages = async () => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return await admin
        .firestore()
        .collection("languages")
        .orderBy("occurrences", "desc")
        .get()
        .then((res) => {
            return buildLanguage(res);
        })
}

const buildLanguage = (res: any) => {
    const languages = [{}]
    res.forEach((doc: any) => {
        const language = doc.data()
        languages.push(language)
    })
    return languages.splice(1)
}

