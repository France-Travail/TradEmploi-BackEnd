import * as admin from "firebase-admin"
// import * as serviceAccount from "../../credentials/credentials.json"
import { formatDate } from "../data/utils"
// const params = {
//   type: serviceAccount.type,
//   projectId: serviceAccount.project_id,
//   privateKeyId: serviceAccount.private_key_id,
//   privateKey: serviceAccount.private_key,
//   clientEmail: serviceAccount.client_email,
//   clientId: serviceAccount.client_id,
//   authUri: serviceAccount.auth_uri,
//   tokenUri: serviceAccount.token_uri,
//   authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
//   clientC509CertUrl: serviceAccount.client_x509_cert_url,
// }

export const rates = async () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      // credential: admin.credential.cert(params),
      // databaseURL: serviceAccount.url,
    })
  }
  return await admin
    .firestore()
    .collection("rates")
    .orderBy("date", "desc")
    .get()
    .then((res) => {
      return buildRates(res)
    })
}

export const rate = async (language: String) => {
  if (!admin.apps.length) {
    admin.initializeApp({})
  }
  return await admin
    .firestore()
    .collection("rates")
    .orderBy("date", "desc")
    .get()
    .then((res) => {
      return buildRatesByLanguage(res, language)
    })
}

const buildRates = (res: any) => {
  const rates = [{}]
  res.forEach((doc: any) => {
    const data = doc.data()
    const rate = buildRate(data)
    rates.push(rate)
  })
  return rates.splice(1)
}

const buildRatesByLanguage = (res: any, language: String) => {
  const rates = [{}]
  res.forEach((doc: any) => {
    const data = doc.data()
    if (language === data.language) {
      const rate = buildRate(data)
      rates.push(rate)
    }
  })
  return rates.splice(1)
}

const buildRate = (rate: any) => {
  const day: Date = rate.date.toDate()
  return {
    day: formatDate(day),
    hour: rate.hour,
    language: rate.language ? rate.language : "Français",
    facilityGrade:
      rate.grades && rate.grades.length > 0 ? rate.grades[0] : "-1",
    efficientGrade:
      rate.grades && rate.grades.length > 0 ? rate.grades[1] : "-1",
    offerLinked: rate.offerLinked ? rate.offerLinked : "",
    comment: rate.comment ? rate.comment.replace(/\r?\n|\r/g, "") : "",
    conversationDuration: rate.conversationDuration ? rate.conversationDuration : "",
    typeEntretien: rate.typeEntretien ? rate.typeEntretien : ""
  }
}
