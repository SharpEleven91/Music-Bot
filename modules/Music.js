const Discord = require("discord.js");
const config = require("../config.json");
const YTDL = require("ytdl-core");
const Utility = require("./Utility.js");
const YTSearch = require("youtube-search-promise");
const API_KEY = config.api_key;
module.exports = class Music {
  constructor() {
    this.paused = false; // true if paused, false if not
    this.ActiveMessage = this.SongList = []; // an array of strings representing the playlist
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
      message.channel.send(richMessage).then(delete_message => {
        delete_message.delete(
          response.player_response.videoDetails.lengthSeconds * 1000
        );
      });
    });
    this.Remove();
    this.NowPlaying.on("end", () => {
      if (this.Queue.length >= 1) {
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
      Utility.sendChannelMessage("Playlist is currently empty");
    } else {
      Utility.send(message, "Playlist", this.SongList);
    }
  }
  // pause current song
  Pause(message) {
    if (this.NowPlaying && !this.paused) {
      this.paused = true;
      this.NowPlaying.pause();
      Utility.sendChannelMessage(message, "Paused");
    } else if (!this.NowPlaying) {
      Utility.sendChannelMessage(message, "There's nothing to pause");
    } else if (this.NowPlaying && this.paused) {
      Utility.sendChannelMessage(message, "I'm already paused");
    }
  }
  Resume(message) {
    if (this.NowPlaying && this.paused) {
      this.paused = false;
      this.NowPlaying.resume();
      Utility.sendChannelMessage(message, "Resuming");
    }
  }
  CreatePlayList() {
    return null;
  }

  DeletePlayList() {
    return null;
  }
  // skips current song
  Skip(message) {
    if (this.NowPlaying) {
      Utility.sendChannelMessage(message, "Current Song Skipped");
      this.NowPlaying.end();
    } else {
      Utility.sendChannelMessage(message, "Nothing to Skip");
    }
  }
  Remove() {
    this.Queue.shift();
    this.SongList.shift();
  }
  RabbitHole(message, args) {
    return null;
  }
  // if in the voice channel already and playing a song
  // add song to the queue
  // else join the voice channel of requester and play song
  Add(message, args) {
    // checks if the request is valid
    if (args.length <= 0) {
      Utility.sendChannelMessage(message, "Try again with a valid link");
    } else if (!YTDL.validateURL(args[0])) {
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
              Utility.sendChannelMessage(message, "You must be in a voice channel to make a request");
            } else {
            message.member.voiceChannel
              .join()
              .then(connection => {
                this.Play(connection, message);
              })
              .catch(error => console.log(error));
            }
          } else {
            YTDL.getBasicInfo(song[0].link, (error, response) => {
              if (error) {
                this.Queue.shift();
                return message.channel.send("Song is Not Available");
              }
              let requestDisplay = response.player_response.videoDetails.title;
              this.SongList.push(requestDisplay);
              Utility.sendChannelMessage(message, requestDisplay + " added to playlist");
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
      } else {
        YTDL.getBasicInfo(args[0], (error, response) => {
          if (error) {
            this.Queue.shift();
            Utility.sendChannelMessage(message, "Try a different link");
          }
          let richMessage = new Discord.RichEmbed().setTitle("");
        });
      }
    }
  }
};
