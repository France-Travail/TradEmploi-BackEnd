const axios = require("axios")

require("dotenv").config()
const translateWithDeepl = (text, targetLang, sourceLang) => {
  console.log("translateWithDeepl", text)
  return axios
    .get(
      `https://api-free.deepl.com/v2/translate?auth_key=${
        process.env.DEEPL_API_KEY
      }&text=${encodeURI(
        text
      )}&source_lang=${sourceLang}&target_lang=${targetLang}`
    )
    .then((response) => {
      return response.data.translations[0].text
    })
    .catch((error) => {
      console.error(error)
    })
}

module.exports = {
  translateWithDeepl,
}
