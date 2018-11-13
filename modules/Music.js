const Discord = require("discord.js");
const config = require("../config.json");
const YTDL = require("ytdl-core");
const YTSearch = require("youtube-search-promise");
const commands = config.commands;
const PREFIX = config.prefix;
const API_KEY = config.api_key;
module.exports = class Music {
    constructor() {
        this.NowPlaying = false;
        this.Queue = [];
    }
    Play(connection, message) {
    this.NowPlaying = connection.playStream(
      YTDL(this.Queue[0], { filter: "audioonly", quality: "highest" })
    );
    YTDL.getBasicInfo(this.Queue[0], (error, response) => {
      if (error) {
        return console.log(error);
      }
      let requestDisplay = response.player_response.videoDetails.title;
      let richMessage = new Discord.RichEmbed()
        .setTitle("Now Playing: " + requestDisplay)
        .setColor(0xff0000);
      message.channel.send(richMessage);
    });
    this.Queue.shift();
    this.NowPlaying.on("end", () => {
      if (this.Queue.length >= 1) {
        this.Play(connection, message);
      } else {
        console.log("disconnecting");
        connection.disconnect();
      }
    });
  }
  Skip(message) {
    if (this.NowPlaying) {
      let richMessage = new Discord.RichEmbed()
        .setTitle("Song Skipped")
        .setColor(0xff0000);
      message.channel.send(richMessage);
      this.NowPlaying.end();
    } else {
      let richMessage = new Discord.RichEmbed()
        .setTitle("Nothing to Skip")
        .setColor(0xff0000);
      message.channel.send(richMessage);
    }
  }
  Add(message, args) {
    if (args.length <= 0) {
      let richMessage = new Discord.RichEmbed()
        .setTitle("Try again with a link")
        .setColor(0xff0000);
      return message.channel.send(richMessage);
    }
    if (!YTDL.validateURL(args[0])) {
      const opts = { maxResults: 1, key: API_KEY };
      YTSearch(args.join(" "), opts)
        .then(results => {
          return results;
        })
        .catch(error => {
          console.log(error);
        })
        .then(song => {
          this.Queue.push(song[0].link);
          if (!message.guild.voiceConnection) {
            message.member.voiceChannel
              .join()
              .then(connection => {
                this.Play(connection, message);
              })
              .catch(error => console.log(error));
          } else {
            YTDL.getBasicInfo(song[0].link, (error, response) => {
              if (error) {
                return message.channel.send("Song is Not Available");
              }
              let requestDisplay = response.player_response.videoDetails.title;
              let richMessage = new Discord.RichEmbed()
                .setTitle(requestDisplay + " added to playlist")
                .setColor(0xff0000);
              message.channel.send(richMessage);
            });
          }
        });
    } else {
      this.Queue.push(args[0]);
      if (!message.guild.voiceConnection) {
        message.member.voiceChannel
          .join()
          .then(connection => {
            this.Play(connection, message);
          })
          .catch(error => console.log(error));
      }
    }
  }
}
