const fs = require('fs');

function deleteFile(pathImg) {
    fs.unlink(pathImg, (err) => {
        if (err) {
            throw err;
        }
        console.log(`${pathImg} deleted`);
    });
}

module.exports = {
    deleteFile
}