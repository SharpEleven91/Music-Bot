const Discord = require('discord.js');
const config = require('./config.json');
const Music = require('./modules/Music.js');
const commands = config.commands;
const Bot = new Discord.Client();
const PREFIX = config.prefix;
const Radio = new Music();

Bot.login(config.token);
Bot.on("message", (message) => {
    if (!message.content.startsWith(PREFIX)) { return };
    let command = message.content.slice(1, message.length).split(' ')[0].toLowerCase();
    if (!commands[command]) {
        let richMessage = new Discord.RichEmbed().setTitle('Invalid Command: Type -help to see a list of commands').setColor(0xFF0000);
        return message.channel.send(richMessage);
    }
    let args = message.content.split(' ').slice(1, message.content.length);
    if (command === 'play') {
        Radio.Add(message, args);
    } else if (command === 'skip') {
        Radio.Skip(message);
    } else if (command === 'playlist') {
        Radio.ShowQueue(message);
    } else if (command === 'pause') {
        Radio.Pause(message);
    } else if (command === 'resume') {
        Radio.Resume(message);
    } else if (command === 'discover') {
         Radio.Discover(message, args);
    }
})