async function removeCarriageReturn(text) {
    return text.replace(/\n/g, " ")
}

async function countNumberCharactersInText(text) {
    let regex = /[a-zA-Z0-9]/g
    return text.match(regex).length
}

module.exports = {
    removeCarriageReturn,
    countNumberCharactersInText,
}