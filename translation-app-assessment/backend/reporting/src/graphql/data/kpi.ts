import {CronJob} from "cron"
import * as admin from "firebase-admin"
import {Device, DeviceDto} from "../../model/device"
import {Role} from "../../model/role"
import {TranslationMode} from "../../model/translationMode"
import {formatDate, formatTime} from "./utils"


const getConversation = (messages: any, memberTotal: number) => {
  return {
    begin: formatTime(messages[0].hour),
    end: formatTime(messages[messages.length - 1].hour),
    duration: getDuration(messages[messages.length - 1].hour, messages[0].hour),
    languages: getGuestLanguages(messages),
    nbUsers: memberTotal,
    translationMode: getTranslationMode(messages),
  }
}

const getGuestLanguages = (messages: any) => {
  return messages
      .filter((item: any) => item.role === Role.GUEST)
      .filter(
          (item: any, pos: any, arr: any) =>
              pos === 0 || item.languageName !== arr[pos - 1].languageName
      )
      .map((m: any) => m.languageName)
      .join(",")
}

const getDevice = (members: any, support: string) => {
  const guestsDevices: Device[] = []
  const advisorDevice: Device[] = []
  members.forEach((m: any) => {
    m.role === Role.GUEST && m.device
        ? guestsDevices.push(mapMemberToDevice(m.device))
        : advisorDevice.push(mapMemberToDevice(m.device))
  })
  return {
    support: support,
    guest: formatDevice(guestsDevices),
    advisor: formatDevice(advisorDevice),
  }
}

const mapMemberToDevice = (device: any) => {
  return {
    equipment: device.type,
    os: {
      name: device.os,
      version: device.osVersion,
    },
    browser: {
      name: device.browser,
      version: device.browserVersion,
    },
  }
}

const formatDevice = (devices: Device[]) => {
  const devicesDto = deviceToDeviceDto(devices)
  return {
    equipment: devicesDto.equipments.join(","),
    os: {
      name: devicesDto.osName.join(","),
      version: devicesDto.osVersion.join(","),
    },
    browser: {
      name: devicesDto.browserName.join(","),
      version: devicesDto.browserVersion.join(","),
    },
  }
}

const deviceToDeviceDto = (devices: Device[]): DeviceDto => {
  const equipments: string[] = [],
      osName: string[] = [],
      osVersion: string[] = [],
      browserName: string[] = [],
      browserVersion: string[] = []
  devices.forEach((d: Device) => {
    equipments.push(d.equipment)
    osName.push(d.os.name)
    osVersion.push(d.os.version)
    browserName.push(d.browser.name)
    browserVersion.push(d.browser.version)
  })
  return {
    equipments: equipments,
    osName: osName,
    osVersion: osVersion,
    browserName: browserName,
    browserVersion: browserVersion,
  }
}

const formatNumber = (n: any) => {
  return (n < 10 ? "0" : "") + n
}

const getDuration = (lastMessageTime: string, firstMessageTime: string) => {
  const l = lastMessageTime.split(":")
  const f = firstMessageTime.split(":")
  const nbSeconds =
      Number(l[0]) * 3600 +
      Number(l[1]) * 60 -
      (Number(f[0]) * 3600 + Number(f[1]) * 60)
  return (
      formatNumber((nbSeconds / 3600) | 0) +
      "h" +
      formatNumber(((nbSeconds % 3600) / 60) | 0)
  )
}

const getTranslationMode = (messages: any[]) => {
  const mode = [
    TranslationMode.TEXT,
    TranslationMode.TEXTANDVOICE,
    TranslationMode.VOICE,
  ]
  let i = 1
  const textNone: boolean =
      messages.find(
          (message) => message.translationMode !== TranslationMode.TEXT
      ) !== undefined
  const vocalNone: boolean =
      messages.find(
          (message) => message.translationMode !== TranslationMode.VOICE
      ) !== undefined
  if (textNone) {
    i += 1
  }
  if (vocalNone) {
    i -= 1
  }
  return mode[i]
}

const getMembers = (elements: any) => {
  const element = []
  for (const prop in elements) {
    const temp = elements[prop]
    if (temp) {
      element.push(temp)
    }
  }
  return element
}

const getMessagesData = (elements: any) => {
  const element = []
  for (const prop in elements) {
    const temp = elements[prop]
    if (temp && temp.message) {
      element.push(temp.message)
    }
  }
  return element
}

const kpiOnDb = async (data: any, roomId: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({})
  }
  return admin.firestore().collection("kpis").doc(roomId).set(data)
}

const retrieveKpi = async () => {
  if (!admin.apps.length) {
    admin.initializeApp({})
  }
  return admin
      .firestore()
      .collection("kpis")
      .orderBy("day", "desc")
      .get()
      .then((res) => {
        return buildKpis(res)
      })
}

const buildKpis = (res: any) => {
  const kpis = [{}]
  res.forEach((doc: any) => {
    const data = doc.data()
    data.day = formatDate(data.day.toDate())
    kpis.push(data)
  })
  return kpis.splice(1)
}

export const getKpi = async () => {
  return retrieveKpi()
}

export const launchCron = async () => {
  const job = new CronJob(
      "* 12,17 * * *",
      async () => {
        if (!admin.apps.length) {
          admin.initializeApp({})
        }
        await admin
            .database()
            .ref("chats")
            .once("value")
            .then(async (snapshot: any) => {
              const chats = snapshot?.val()
              await createkpis(chats)
            })
        await admin.database().ref("chats").remove()
      },
      null,
      true,
      "Europe/Paris"
  )
  job.start()
}

const createkpis = async (chats: any) => {
  for (const roomID in chats) {
    const chat = chats[roomID]
    if (chat) {
      try {
        console.log("chat roomID >> :")
        console.log(roomID)
        console.log("chat >> :")
        console.log(chat)
        const messages = chat.messages ? getMessagesData(chat.messages) : []
        const members = getMembers(chat.members)
        const conversation =
            messages.length > 0 ? getConversation(messages, members.length) : {}
        const device = getDevice(members, chat.support)
        const kpi = {
          day: new Date(messages[0].date),
          roomId: roomID,
          conversation: conversation,
          device: device,
        }
        console.log("kpi >> :")
        console.log(kpi)
        await kpiOnDb(kpi, roomID)
      } catch (error) {
        console.log(error)
      }
    }
  }
}
