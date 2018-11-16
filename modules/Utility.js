const Discord = require("discord.js");
const config = require("../config.json");
module.exports.sendChannelMessage = function(
  message,
  content,
  description = ""
) {
  let richMessage = new Discord.RichEmbed()
    .setTitle(content)
    .setDescription(description);
  message.channel.send(richMessage);
};

module.exports.sendChannelMessageTemp = function(
  message,
  content,
  timeLimit,
  description = ""
) {
  let richMessage = new Discord.RichEmbed()
    .setTitle(content)
    .setDescription(description);
  message.channel.send(richMessage).then(delete_message => {
    delete_message.delete(timeLimit);
  });
};

module.exports.findLink = function(terms) {
  const opts = { maxResults: 1, key: API_KEY };
  YTSearch(args.join(" "), opts)
    .then(song => {
      return song[0].link;
    })
    .catch(error => console.log(error));
};

module.exports.getSongInfo = async function(link) {
  await YTDL.getBasicInfo(link, (error, response) => {
    if (error) {
      return false;
    }
    return { title: response.player_response.videoDetails.title,
             length: response.player_response.videoDetails.lengthSeconds }
  });
}