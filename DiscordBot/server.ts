/**
 * File: server.ts
 * Date: July 30, 2020
 * Author: Chaz-Lee Pierre
 * Purpose: This file contains the main logic for the '10,000 hours' Discord bot.
 *          10,000 hours is an Overwatch platform who's goal is to help players 
 *          ranked Diamond and below reach the Master rank.
 */

import * as api from './api';
import * as db from './database';
import { Player } from './models/player';
import { OWProfile } from './models/owprofile';

require('dotenv').config({ path: "./.env" });
const { OWNER, TOKEN } = process.env;

const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const PREFIX = '-';
const commandFiles = fs.readdirSync('./commands').filter((file: any) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.once('ready', async () => {
    console.log(`Logged in as ${bot.user.tag}! (${bot.user.id})`);
    bot.user.setActivity('with Commando');
});

bot.on('message', async (message: any) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = bot.commands.get(commandName)
        || bot.commands.find((cmd: any) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.args && !args.length) {
        let reply = `${message.author}, this command requires arguments. `;

        if (command.usage) {
            reply += `The proper usage would be: \`${PREFIX}${command.name} ${command.usage}\`.`;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
})

bot.on('guildMemberAdd', async (member: any) => {
    let p = await api.getPlayer(member.user.id, member.user.username, member.user.discriminator, member.user.avatar);
    const channel = member.guild.channels.cache.find((ch: any) => ch.name === 'general');
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}`);
});

bot.on('error', console.error);

bot.login(TOKEN);

db.sync().catch((err: any) => console.log(err));