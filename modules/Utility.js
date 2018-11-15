const Discord = require("discord.js");

module.exports.sendChannelMessage = function (message, content, description = "") {
  let richMessage = new Discord.RichEmbed()
    .setTitle(content)
    .setDescription(description);
  message.channel.send(richMessage);
};

module.exports.sendChannelMessageTemp = function(message, content, timeLimit, description = "") {
    let richMessage = new Discord.RichEmbed()
      .setTitle(content)
      .setDescription(description);
    message.channel.send(richMessage)
        .then(delete_message => {
            delete_message.delete(timeLimit)
        }
    )
};