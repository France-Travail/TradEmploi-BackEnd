import * as admin from "firebase-admin"
import {formatDate} from "../data/utils"

export const rates = async () => {
  if (!admin.apps.length) {
    admin.initializeApp({
    })
  }
  return admin
    .firestore()
    .collection("rates")
    .orderBy("date", "desc")
    .get()
    .then((res) => {
      return buildRates(res)
    })
}

export const rate = async (language: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({})
  }
  return admin
    .firestore()
    .collection("rates")
    .orderBy("date", "desc")
    .get()
    .then((res) => {
      return buildRatesByLanguage(res, language)
    })
}

const buildRates = (res: any) => {
  const result = [{}]
  res.forEach((doc: any) => {
    const data = doc.data()
    const r = buildRate(data)
    result.push(r)
  })
  return result.splice(1)
}

const buildRatesByLanguage = (res: any, language: string) => {
  const result = [{}]
  res.forEach((doc: any) => {
    const data = doc.data()
    if (language === data.language) {
      const r = buildRate(data)
      result.push(r)
    }
  })
  return result.splice(1)
}

const buildRate = (r: any) => {
  const day: Date = r.date.toDate()
  return {
    day: formatDate(day),
    hour: r.hour,
    language: r.language ? r.language : "Français",
    facilityGrade:
        r.grades && r.grades.length > 0 ? r.grades[0] : "-1",
    efficientGrade:
        r.grades && r.grades.length > 0 ? r.grades[1] : "-1",
    offerLinked: r.offerLinked ? r.offerLinked : "",
    comment: r.comment ? r.comment.replace(/\r?\n|\r/g, "") : "",
    conversationDuration: r.conversationDuration ? r.conversationDuration : "",
    typeEntretien: r.typeEntretien ? r.typeEntretien : "",
    nbMessagesAdvisor: r.nbMessagesAdvisor ? r.nbMessagesAdvisor : 0,
    nbMessagesGuest: r.nbMessagesGuest ? r.nbMessagesGuest : 0,
    user: r.user ? r.user : "",
    agency: r.agency ? r.agency : "",
    typeSTT: r.typeSTT ? r.typeSTT: "",
    isTradDoc: r.isTradDoc ? r.isTradDoc: ""
  }
}
