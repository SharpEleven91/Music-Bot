const Discord = require("discord.js");
const config = require("../config.json");
const YTDL = require("ytdl-core");
const utility = require("./utility.js");
const YTSearch = require("youtube-search-promise");
const API_KEY = config.api_key;
module.exports = class Music {
  constructor() {
    this.looping = false;
    this.discovery = false;
    this.paused = false; // true if paused, false if not
    this.nowPlaying = false; // holds stream else false
    this.queue = []; // holds an array of objects with fields {length: Int, title: String, link: String}
  }
  // take a voice channel connection and a message and playing request over stream
  play(connection, message) {
    let currentSong = this.queue[0];
    this.nowPlaying = connection.playStream(
      YTDL(currentSong.link, { filter: "audioonly" })
    );
    utility.sendChannelMessageTemp(
      message,
      "Now Playing: " + currentSong.title,
      currentSong.length * 1000
    );
    if (this.discovery) {
      let randomSong =
        currentSong.reccommended[
          Math.floor(Math.random() * currentSong.reccommended.length)
        ];
      this.add(message, [randomSong]);
    }
    if (!this.looping) {
      this.remove();
    }
    this.nowPlaying.on("error", () => {
      console.log(error);
    });
    this.nowPlaying.on("end", () => {
      if (this.queue.length >= 1) {
        this.nowPlaying.destroy(error => console.log(error));
        this.play(connection, message);
      } else {
        connection.disconnect();
        this.nowPlaying.destroy(error => console.log(error));
      }
    });
  }
  // sets loop true
  loop(message) {
    if (this.looping && this.nowPlaying) {
      this.looping = false;
      utility.sendChannelMessage(message, "No longer looping");
    } else if (!this.looping && this.nowPlaying) {
      this.looping = true;
      utility.sendChannelMessage(message, "Current song is now on loop");
    } else {
      utility.sendChannelMessage(message, "Nothing to loop");
    }
  }
  // show the current queue
  showQueue(message) {
    if (this.queue.length <= 0) {
      utility.sendChannelMessage(message, "Playlist is currently empty");
    } else {
      utility.sendChannelMessage(
        message,
        "Playlist",
        this.queue.map(song => song.title)
      );
    }
  }
  // pause current song
  pause(message) {
    if (this.nowPlaying && !this.paused) {
      this.paused = true;
      this.nowPlaying.pause();
      utility.sendChannelMessageTemp(message, "Track has been paused", 6000);
    } else if (!this.nowPlaying) {
      utility.sendChannelMessageTemp(
        message,
        "No Tracks are current Playing",
        6000
      );
    } else if (this.nowPlaying && this.paused) {
      utility.sendChannelMessageTemp(message, "Track is already paused", 6000);
    }
  }
  // resume the current stream if paused
  resume(message) {
    if (this.nowPlaying && this.paused) {
      this.paused = false;
      this.nowPlaying.resume();
      utility.sendChannelMessageTemp(message, "Resuming", 6000);
    }
  }
  reset() {
    this.nowPlaying.destroy();
    this.queue = [];
    this.discover = false;
    this.pause = false;
  }
  createPlayList() {
    return null;
  }
  // Create an infinite playlist based on the request
  discover(message, args) {
    if (args.length <= 0) {
      return utility.sendChannelMessageTemp(message, "Please give terms to search or a video link");
    }
    if (this.discovery) {
      if (args[0].toLowerCase() === "stop") {
        this.discovery = false;
        this.queue = [];
        this.nowPlaying.end();
        return null;
      } else {
        utility.sendChannelMessage(
          message,
          "A Discovery playlist has already been started"
        );
      }
    } else {
      this.discovery = true;
      utility.sendChannelMessage(
        message,
        "A Discovery playlist has been started"
      );
      this.add(message, args);
    }
  }
  clearPlaylist(message) {
    if (this.queue.length <= 0) {
      utility.sendChannelMessageTemp(message, "The queue is already empty", 6000);
    } else {
      this.queue = [];
      utility.sendChannelMessageTemp(message, "The queue has been cleared", 6000);
    }
  }
  // skip current song
  skip(message) {
    if (this.nowPlaying) {
      utility.sendChannelMessage(message, "Current Song Skipped");
      this.nowPlaying.end();
    } else {
      utility.sendChannelMessage(message, "Nothing to Skip");
    }
  }
  // remove a song from the beginning of the queue
  remove() {
    this.queue.shift();
  }
  // add a song to the end of the queue
  addToQueue(song) {
    this.queue.push(song);
  }
  // if in the voice channel already and playing a song
  // add song to the queue
  // else join the voice channel of requester and play song
  add(message, args) {
    // checks if the request is valid
    if (args.length <= 0) {
      return utility.sendChannelMessage(message, "Try again with a valid link");
    }
    utility
      .findLink(args)
      .then(link => {
        return utility.getSongInfo(link);
      })
      .then(song => {
        if (!message.guild.voiceConnection) {
          if (!message.member.voiceChannel) {
            utility.sendChannelMessage(
              message,
              "You must be in a voice channel to make a request"
            );
          } else {
            this.addToQueue(song);
            message.member.voiceChannel
              .join()
              .then(connection => {
                this.play(connection, message);
              })
              .catch(error => console.log(error));
          }
        } else {
          this.addToQueue(song);
          utility.sendChannelMessage(
            message,
            song.title + " added to playlist"
          );
        }
      })
      .catch(error => {
        console.log(error);
        utility.sendChannelMessage(message, "Sorry, No Songs were found");
      });
  }
};
