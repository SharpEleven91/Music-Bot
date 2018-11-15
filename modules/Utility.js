const Discord = require("discord.js");

module.exports.sendChannelMessage = function (message, content, description = "") {
  console.log("z");
  let richMessage = new Discord.RichEmbed()
    .setTitle(content)
    .setDescription(description);
  message.channel.send(richMessage);
};
