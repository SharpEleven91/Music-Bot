const fs = require('fs');
const currentDatePath = './logs/' + new Date().toDateString() + ".txt";

// if the file doesn't exist create it
// and append data to file
module.exports = function log(message) {
    function leadingZeroString(input) {
        return input.toString().padStart(2, 0);
    }
    if  (!message.author.bot) {
        let messageTime = message.createdAt;
        const builtMessage = `[${leadingZeroString(messageTime.getHours())}:${leadingZeroString(messageTime.getMinutes())}:${leadingZeroString(messageTime.getSeconds())}] ${message.author.tag}: ${message.content}\n`
        fs.appendFile(currentDatePath, builtMessage, 'utf8', function (error) {
            if (error) {
                console.log(error) 
            } else {
                console.log(`Logged: ${builtMessage}`);
            }
        })
    }
}