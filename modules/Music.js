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
    this.NowPlaying = false; // holds stream
    this.Queue = []; // holds an array of objects with fields {length: Int, title: String, link: String}
  }
  // takes a voice channel connection and a message
  Play(connection, message) {
    let currentSong = Utility.getSongInfo(this.Queue[0]);
    this.NowPlaying = connection.playStream(
      YTDL(currentSong.link, { filter: "audioonly" })
    );
    Utility.sendChannelMessageTemp(message, "Now Playing: " + currentSongInfo.title, currentSongInfo.length * 1000);
    this.Remove();
    this.NowPlaying.on("end", () => {
      if (this.Queue.length >= 1) {
        this.Play(connection, message);
      } else {
        connection.disconnect();
        this.NowPlaying.destroy();
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
  RabbitHole(args) {
    // infinite playlist built off reccomendations from initial argument
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
  }
  RabbitHole(message, args) {
    return null;
  }
  AddToQueue(song) {
    this.Queue.push(song);
  }
  // if in the voice channel already and playing a song
  // add song to the queue
  // else join the voice channel of requester and play song
  Add(message, args) {
    // checks if the request is valid
    if (args.length <= 0) {
      return Utility.sendChannelMessage(message, "Try again with a valid link");
    } else if (!YTDL.validateURL(args[0])) {
      Utility.findLink(args)
        .then(link => {
          return Utility.getSongInfo(link)
        })
        .then(song => {
          if (!message.guild.voiceConnection) {
            if (!message.member.voiceChannel) {
              Utility.sendChannelMessage(message, "You must be in a voice channel to make a request");
          } else {
          this.AddToQueue(song);
          message.member.voiceChannel
            .join()
            .then(connection => {
              this.Play(connection, message);
            })
            .catch(error => console.log(error));
          }
        } else {
          this.AddToQueue(song);
          Utility.sendChannelMessage(message, song.title + " added to playlist");
      }
    }).catch(error => console.log(error));
  
    }
  }
};
