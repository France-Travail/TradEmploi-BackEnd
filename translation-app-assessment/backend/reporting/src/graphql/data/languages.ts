import {CronJob} from "cron"
import * as admin from "firebase-admin"


async function createLanguage(isoCode: string, occurrences: string) {
  const language = {
    isoCode: isoCode,
    occurrences: occurrences
  }
  console.log("language >> :")
  console.log(language)
  await languageOnDb(language, isoCode)
}

const languageOnDb = async (data: any, isoCode: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({})
  }
  return await admin.firestore().collection("languages").doc(isoCode).set(data)
}


export const launchCronForLanguages = async () => {
  const job = new CronJob(
      "* 12,17 * * *",
      async () => {
        if (!admin.apps.length) {
          admin.initializeApp({})
        }
        let languagesSelected: string[] = [];
        await admin.firestore().collection("rates").get().then((res) => {
              res.forEach((doc: any) => {
                const data = doc.data();
                languagesSelected = languagesSelected.concat(data.language.split(','));
              })
            }
        )
        const mapLanguages = languagesSelected.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
        const languagesSorted = new Map([...mapLanguages.entries()].sort((a, b) => b[1] - a[1]));
        Array.from(languagesSorted.keys()).forEach(isoCode =>
            createLanguage(isoCode, languagesSorted.get(isoCode)));
      },
      null,
      true,
      "Europe/Paris"
  )
  job.start()
}
