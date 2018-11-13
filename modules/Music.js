const Discord = require("discord.js");
const config = require("../config.json");
const YTDL = require("ytdl-core");
const YTSearch = require("youtube-search-promise");
const API_KEY = config.api_key;
module.exports = class Music {
  constructor() {
    this.ActiveMessage = false;
    this.SongList = [];
    this.NowPlaying = false; // holds stream
    this.Queue = []; // holds current queue of songs
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
      message.channel.send(richMessage).then(delete_message => { delete_message.delete(response.player_response.videoDetails.lengthSeconds * 1000) });
    });
    this.SongList.shift();
    this.Queue.shift();
    this.NowPlaying.on("end", () => {
      if (this.Queue.length >= 1) {
        this.NowPlaying.destroy();
        this.Play(connection, message);
      } else {
        this.NowPlaying.destroy();
        connection.disconnect();
      }
    });
  }
  // shows the current queue
  ShowQueue(message) {
    if (this.Queue.length <= 0) {
        let richMessage = new Discord.RichEmbed().setTitle("Playlist is currently Empty");
        return message.channel.send(richMessage);
    }
    let richMessage = new Discord.RichEmbed().setTitle("Playlist").setDescription(this.SongList);
    message.channel.send(richMessage);
  }

  CreatePlayList() {
    return null;
  }

  DeletePlayList() {
    return null 
  }

  Skip(message) {
    if (this.NowPlaying) {
      let richMessage = new Discord.RichEmbed()
        .setTitle("Song Skipped")
        .setColor(0xff0000);
      message.channel.send(richMessage);
      this.NowPlaying.end('skipped');
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
            if (!message.member.voiceChannel) {
                let richMessage = new Discord.RichEmbed()
                .setTitle("You have to be in a voice channel to request a song")
                .setColor(0xff0000);
                return message.channel.send(richMessage)
            }
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
              this.SongList.push(requestDisplay);
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
};
