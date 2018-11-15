const Discord = require("discord.js");
const config = require("../config.json");
const YTDL = require("ytdl-core");
const Utility = require("./Utility.js");
const YTSearch = require("youtube-search-promise");
const API_KEY = config.api_key;
module.exports = class Music {
  constructor() {
    this.paused = false; // true if paused, false if not
    this.ActiveMessage = [];
    this.SongList = []; // an array of strings representing the playlist
    this.NowPlaying = false; // holds stream
    this.Queue = []; // holds current queue of songs
  }
  // takes a voice channel connection and a message
  Play(connection, message) {
    this.NowPlaying = connection.playStream(
      YTDL(this.Queue[0], { filter: "audioonly" })
    );
    YTDL.getBasicInfo(this.Queue[0], (error, response) => {
      if (error) {
        return console.log(error);
      }
      let requestDisplay = response.player_response.videoDetails.title;
      Utility.sendChannelMessageTemp(message, "Now Playing: " + requestDisplay, response.player_response.videoDetails.lengthSeconds * 1000);
    });
    this.Remove();
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
      Utility.sendChannelMessage("Playlist is currently empty");
    } else {
      Utility.sendChannelMessage(message, "Playlist", this.SongList);
    }
  }
  // pause current song
  Pause(message) {
    if (this.NowPlaying && !this.paused) {
      this.paused = true;
      this.NowPlaying.pause();
      Utility.sendChannelMessageTemp(message, "Paused", 6000);
    } else if (!this.NowPlaying) {
      Utility.sendChannelMessageTemp(message, "There's nothing to pause", 6000);
    } else if (this.NowPlaying && this.paused) {
      Utility.sendChannelMessageTemp(message, "I'm already paused", 6000);
    }
  }
  Resume(message) {
    if (this.NowPlaying && this.paused) {
      this.paused = false;
      this.NowPlaying.resume();
      Utility.sendChannelMessageTemp(message, "Resuming", 6000);
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
          if (!message.guild.voiceConnection) {
            if (!message.member.voiceChannel) {
              Utility.sendChannelMessage(message, "You must be in a voice channel to make a request");
            } else {
            console.log(song[0]);
            this.Queue.push(song[0].link);
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
                return message.channel.send("Song is Not Available");
              }
              let requestDisplay = response.player_response.videoDetails.title;
              this.Queue.push(song[0].link);
              this.SongList.push(requestDisplay);
              Utility.sendChannelMessage(message, requestDisplay + " added to playlist");
            });
          }
        });
    } else {
      if (!message.guild.voiceConnection) {
        message.member.voiceChannel
          .join()
          .then(connection => {
            this.Queue.push(args[0]);
            this.Play(connection, message);
          })
          .catch(error => console.log(error));
      } else {
        YTDL.getBasicInfo(args[0], (error, response) => {
          if (error) {
            Utility.sendChannelMessage(message, "Try a different link");
          } else {
            let requestDisplay = response.player_response.videoDetails.title;
            this.Queue.push(args[0]);
            this.SongList.push(requestDisplay);
            Utility.sendChannelMessage(message, requestDisplay + " added to playlist");
          }
        });
      }
    }
  }
};
