const axios = require("axios")

require("dotenv").config()
const translateWithDeepl = (text, targetLang, sourceLang, targetLangSplitted, sourceLangSplitted, currentUserDomain, isTradTonDoc) => {
    console.log(`Use DeepL cloud translation from ${sourceLang} to ${targetLang} by ${currentUserDomain} for ${isTradTonDoc ? 'TradTonDoc' : 'Chat'}`)
    let glossaryParameter = getGlossaryParameter(sourceLang, targetLang);
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'DeepL-Auth-Key ' + process.env.DEEPL_API_KEY
        }
    }

    if(targetLang.includes('EN') || targetLang.includes('PT')) {
        targetLangSplitted = targetLang;
    }

    const data = {
        'text': [text],
        'tag_handling': '',
        'source_lang': sourceLangSplitted,
        'target_lang': targetLangSplitted,
        'glossary_id': glossaryParameter
    }
    console.log(data);
    return axios
    .post(
      'https://api.deepl.com/v2/translate',
        data,
        config
    )
    .then((response) => {
        const texts = [];
        response.data.translations.forEach(translation => {
            texts.push(translation.text)
        })
        return texts.toString();
    })
    .catch((error) => {
      console.error(error)
    })
}


function getGlossaryParameter(sourceLang, targetLang) {
    let glossaryEnvVariable = `DEEPL_GLOSSARY_${sourceLang}_${targetLang}`;
    return process.env[glossaryEnvVariable];
}

module.exports = {
  translateWithDeepl,
}
