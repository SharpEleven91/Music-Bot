const Discord = require('discord.js');
const config = require('./config.json');
const YTDL = require("ytdl-core");
const YTSearch = require('youtube-search-promise');
const commands = config.commands;
const Bot = new Discord.Client();
const PREFIX = config.prefix;
const API_KEY = config.api_key;
const fs = require('fs');
let queue = [];
let nowPlaying = false;
function play(connection, message) {
    nowPlaying = connection.playStream(YTDL(queue[0],{filter: 'audioonly', quality: "highest"}));
    YTDL.getBasicInfo(queue[0], (err, response) => {
        if (err) { return console.log(err) }
        const songTitle = new Discord.RichEmbed().setTitle("Now Playing: " + response.media.artist + " - " + response.media.song).setColor(0xFF0000);
        message.channel.send(songTitle);
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
        return message.channel.send('Invalid Command: Type -help to see a list of commands');
    }
    let args = message.content.split(' ').slice(1, message.content.length);
    if (command === 'play') {
        let song;       
        if (args.length <= 0) {
            return message.channel.send('Try again with a link');
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
                        if (err) { return console.log(err) }
                        message.channel.send(response.media.artist + " - " + response.media.song + " added to playlist");
                    })
                }
            })
        } else {
            queue.push(args[0]) 
            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join().then((connection) => {
                    play(connection, message);
                }).catch((error) => console.log(error));
            }
        }
    } else if (command === 'skip' && nowPlaying) {
        if (nowPlaying) {
            message.channel.send('Song Skipped');
            nowPlaying.end();
        } else {
            message.channel.send('Nothing to skip');
        }
    }
})