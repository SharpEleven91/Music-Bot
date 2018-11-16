const Discord = require("discord.js");
const config = require("../config.json");
const YTDL = require("ytdl-core");
const Utility = require("./Utility.js");
const YTSearch = require("youtube-search-promise");
const API_KEY = config.api_key;
module.exports = class Music {
  constructor() {
    this.discovery = false;
    this.paused = false; // true if paused, false if not
    this.ActiveMessage = [];
    this.NowPlaying = false; // holds stream else false
    this.Queue = []; // holds an array of objects with fields {length: Int, title: String, link: String}
  }
  // takes a voice channel connection and a message
  Play(connection, message) {
    let currentSong = this.Queue[0];
    this.NowPlaying = connection.playStream(
      YTDL(currentSong.link, { filter: "audioonly" })
    );
    Utility.sendChannelMessageTemp(
      message,
      "Now Playing: " + currentSong.title,
      currentSong.length * 1000
    );
    if (this.discovery) {
      let randomSong = currentSong.reccommended[Math.floor(Math.random() * currentSong.reccommended.length)];
      console.log(randomSong)
      this.Add(message, [randomSong]);
    }
    this.Remove();
    this.NowPlaying.on("end", () => {
      if (this.Queue.length >= 1) {
        this.NowPlaying.destroy();
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
      Utility.sendChannelMessage(
        message,
        "Playlist",
        this.Queue.map(song => song.title)
      );
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
  Stop(message) {
    this.NowPlaying.destroy();
  }
  Discover(message, args) {
    if (this.discovery) {
      console.log(args);
      if (args[0].toLowerCase() === 'stop') {
        this.discovery = false;
        this.Queue = [];
        this.NowPlaying.end();
      } else {
        Utility.sendChannelMessage(message, "A discovery has already been started");
      }
    } else {
      this.discovery = true;
      Utility.sendChannelMessage(message, "A discovery playlist has been started");
      this.Add(message, args);
    }
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
    
  }
  AddToQueue(song) {
    this.Queue.push(song);
  }
  createConnection(message) {}
  // if in the voice channel already and playing a song
  // add song to the queue
  // else join the voice channel of requester and play song
  Add(message, args) {
    // checks if the request is valid
    if (args.length <= 0) {
      return Utility.sendChannelMessage(message, "Try again with a valid link");
    }
    Utility.findLink(args)
      .then(link => {
        return Utility.getSongInfo(link);
      })
      .then(song => {
        console.log(song);
        if (!message.guild.voiceConnection) {
          if (!message.member.voiceChannel) {
            Utility.sendChannelMessage(
              message,
              "You must be in a voice channel to make a request"
            );
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
          Utility.sendChannelMessage(
            message,
            song.title + " added to playlist"
          );
        }
      })
      .catch(error => {
        console.log(error);
        Utility.sendChannelMessage(message, "Sorry, No Songs were found")
      });
  }
};
