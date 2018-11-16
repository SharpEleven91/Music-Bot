const Discord = require("discord.js");
const config = require("../config.json");
const API_KEY = config.api_key
const YTSearch = require("youtube-search-promise");
const YTDL = require("ytdl-core");
const {promisify} = require('util');

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
  return YTSearch(terms.join(" "), opts)
    .then(song => {
      return song[0].link;
    })
    .catch(error => {
      return false;
    });
};

module.exports.getSongInfo = function(link) {
    const getBasicInfo = promisify(YTDL.getBasicInfo);
    return getBasicInfo(link)
    .then(response => {
      return { title: response.player_response.videoDetails.title,
              length: response.player_response.videoDetails.lengthSeconds,
              link: link }
      });

}