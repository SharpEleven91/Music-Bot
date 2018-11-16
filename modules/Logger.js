const fs = require('fs');
const currentDatePath = './logs/' + new Date().toDateString() + ".txt";


// if the file doesn't exist create it
module.exports = function log(message) {
    if  (!message.author.bot) {
        const builtMessage = `[${message.createdAt}] ${message.author}: ${message.content}\n`
        fs.appendFile(currentDatePath, builtMessage, 'utf8', function (error) {
            if (error) {
                console.log(error) 
            } else {
                console.log(`Logged: ${builtMessage}`);
            }
        })
    }
}