const Discord = require('discord.js');
const config = require('./config.json');
const Bot = new Discord.Client();
const fs = require('fs');

Bot.login(config.token);
Bot.on('ready', () => {
    console.log(`Logged in as ${Bot.user.tag}!`)
})
