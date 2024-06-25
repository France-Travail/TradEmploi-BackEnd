async function encodePdf(data) {
    if (typeof data === "string") {
        const base64EncodedString = data.replace(/^data:\w+\/\w+;base64,/, "");
        return Buffer.from(base64EncodedString, "base64");
    }
}

module.exports = {
    encodePdf
};