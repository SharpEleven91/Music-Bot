const Discord = require("discord.js");
const config = require("./config.json");
const Music = require("./modules/Music.js");
const log = require("./modules/Logger.js"); // logging module
const commands = config.commands; // object containing valid commands
const bot = new Discord.Client(); // discord client instance
const PREFIX = config.prefix; // holds tokens, prefix, commands and their usage
let radio = new Music(); // Music module instance
bot.login(config.token); // logs bot in using token from json
bot.on("message", message => {
  log(message); // logs every message sent in discord ** EXCLUDING Bot messages
  if (!message.content.startsWith(PREFIX)) {
    // ignores every message that doesn't begin with the specified prefix
    return;
  }
  let command = message.content // processes command
    .slice(1, message.length)
    .split(" ")[0]
    .toLowerCase();
  if (!commands[command]) {
    // checks if the command is valid
    let richMessage = new Discord.RichEmbed()
      .setTitle("Invalid Command: Type -help to see a list of commands")
      .setColor(0xff0000);
    return message.channel.send(richMessage);
  }
  let args = message.content.split(" ").slice(1, message.content.length); // processes the arguments given
  if (command === "play" && args.length > 0) {
    radio.add(message, args);
  } else if (command === "skip") {
    radio.skip(message);
  } else if (command === "playlist") {
    radio.showQueue(message);
  } else if (command === "pause" || command === "stop") {
    radio.pause(message);
  } else if (command === "resume" || (command === "play" && args.length <= 0)) {
    radio.resume(message);
  } else if (command === "discover") {
    radio.discover(message, args);
  } else if (command === "reset") {
    radio.reset();
    radio = new Music();
  } else if (command === "clear") {
    radio.clearPlaylist(message);
  }
});
