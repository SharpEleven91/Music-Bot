const Discord = require('discord.js');
const config = require('./config.json');
const YTDL = require("ytdl-core");
const YTSearch = require('youtube-search-promise');
const Music = require('./modules/Music.js');
const commands = config.commands;
const Bot = new Discord.Client();
const PREFIX = config.prefix;
const API_KEY = config.api_key;
const fs = require('fs');
let queue = [];
let nowPlaying = false;
const Radio = new Music();
function play(connection, message) {
    nowPlaying = connection.playStream(YTDL(queue[0],{filter: 'audioonly', quality: "highest"}));
    YTDL.getBasicInfo(queue[0], (err, response) => {
        if (err) { return console.log(err) }
        console.log(response.player_response.videoDetails);
        let requestDisplay = response.player_response.videoDetails.title;
        let richMessage = new Discord.RichEmbed().setTitle("Now Playing: " + requestDisplay).setColor(0xFF0000);
        message.channel.send(richMessage);
    })
    queue.shift();

    nowPlaying.on("end", () => {
        if (queue.length >= 1) {
            play(connection, message);
        } else {
            console.log('disconnecting');
            connection.disconnect();
        }
    })
}

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
/**        let song;       
        if (args.length <= 0) {
            let richMessage = new Discord.RichEmbed().setTitle('Try again with a link').setColor(0xFF0000);
            return message.channel.send(richMessage);
        }
        if (!YTDL.validateURL(args[0])) {
            const opts = { maxResults: 1, key: API_KEY }
            YTSearch(args.join(' '), opts)
            .then(results => {
                return results;
            }).catch(error => {
                console.log(error);
            }).then(song => {
                queue.push(song[0].link);
                if (!message.guild.voiceConnection) {
                    message.member.voiceChannel.join().then((connection) => {
                        play(connection, message);
                    }).catch((error) => console.log(error));
                } else {
                    YTDL.getBasicInfo(song[0].link, (err, response) => {
                        if (err) { return message.channel.send('Song is Not Available') }
                        let requestDisplay = response.player_response.videoDetails.title;
                        let richMessage = new Discord.RichEmbed().setTitle(requestDisplay + " added to playlist").setColor(0xFF0000);
                        message.channel.send(richMessage);
                    });
                }
            })
        } else {
            queue.push(args[0]) 
            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join().then((connection) => {
                    play(connection, message);
                }).catch((error) => console.log(error));
            }
        } **/
    } else if (command === 'skip') {
        Radio.Skip();
/**        if (nowPlaying) {
            let richMessage = new Discord.RichEmbed().setTitle("Song Skipped").setColor(0xFF0000);
            message.channel.send(richMessage);
            nowPlaying.end();
        } else {
            let richMessage = new Discord.RichEmbed().setTitle("Nothing to Skip").setColor(0xFF0000);
            message.channel.send(richMessage);
        } **/
    }
})