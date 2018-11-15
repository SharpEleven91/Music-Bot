const Discord = require("discord.js");

class Utility {
    sendChannelMessage(message, content, description = '') {
        let richMessage = new Discord.RichEmbed()
            .setTitle(content)
            .setDescriptiong(description);
        message.channel.send(richMessage);
    }
}

export default Utility