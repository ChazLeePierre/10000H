import * as api from './api';
import * as db from './database';
import { Authenticate } from './models/authenticate';

import { promises as fs } from "fs";
import { platform } from 'os';
import { Player } from './models/player';
import { OWProfile } from './models/owprofile';

const Discord = require('discord.js');

let portraits: [] = [];

export async function Register(message: any, a: any) {
    let p: Player = await api.getPlayer(message.author.id, message.author.username, message.author.discriminator, message.author.avatar);
    let _authenticated = false;

    if (await db.authExists(p.id)) {
        let current_portrait = await api.getPortrait(a.platform, a.region, a.battletag);

        if (!await db.testAuth(p.id, current_portrait)) {    
            await db.removeAuth(p.id);
            message.channel.send('Overwatch account authenticated.');
            _authenticated = true;
        }
        else {
            let auth = await db.getAuth(p.id);
            await message.channel.send(
                new Discord.MessageEmbed()
                .setAuthor(p.tag, p.picture)
                .setTitle(`Couldn't authenticate your Overwatch account.`)
                .setDescription('Change your profile picture on Overwatch to the photo below and run this command again.')
                .setFooter('NOTE: It may take some time for your profile picture to update. Check back in around 15 minutes to see if it\'s changed.')
                .setImage(auth?.portrait)
            );
            return;
        }
    }

    if (await db.playerExists(p.id)) {
        await db.updatePlayer(p);
    } else {
        await db.createPlayer(p);
    }

    if (await db.OWProfileExists(p.id)) {
        message.channel.send(`Overwatch profile linked.`);
        let owp: OWProfile = await db.updateOWProfile(p.id, await api.retrieveOWProfile(a.platform, a.region, a.battletag));
        await message.channel.send(profileEmbed(p, owp));
    } else if (_authenticated) {
        message.channel.send(`Overwatch profile linked.`);
        let owp: OWProfile = await db.createOWProfile(p.id, await api.retrieveOWProfile(a.platform, a.region, a.battletag));
        await message.channel.send(profileEmbed(p, owp));
    } else {
        await retrievePortraits();
        let random = chooseRandomPortrait();
        await db.insertAuth(new Authenticate(p.id, random[1]));
        await message.channel.send(
            new Discord.MessageEmbed()
            .setAuthor(p.tag, p.picture)
            .setTitle(`Authenticate your Overwatch account.`)
            .setDescription(`Change your profile picture on Overwatch to the photo below \`${random[0]}\` and run this command again.`)
            .setFooter('NOTE: It may take some time for your profile picture to update. Check back in around 15 minutes to see if it\'s changed.')
            .setImage(random[1])
        );
        return;
    }
}

function profileEmbed(p: Player, o: OWProfile) {
    let msg = new Discord.MessageEmbed()
        .setAuthor(p.tag, p.picture)
        .setTitle(`${p.username}'s 10,000 Hours Profile`);

    if (o.isPrivate) {
        msg.setDescription('Your Overwatch profile is set to private. You must make your profile public to participate in matches.')
        .setFooter('You can change your profile privacy in Overwatch in the Options >> Social tab. Once finished, re-link your Overwatch account with 10,000 hours using the -link command.');
    } else if (!o.isRanked)
        msg.setDescription('Your Overwatch profile is not ranked. You must be ranked in competitive to participate in matches.')
        .setFooter('You can become ranked in Overwatch by completing your competitive placement matches. Once finished, re-link your Overwatch account with 10,000 hours using the -link command.');
    else {
        let embedData: { name: string, value: string, inline: boolean }[] = []; 

        o.topHeroes.forEach(h => embedData.push({ name: h.name, value: `Time Played: \`${h.timePlayed}\` | Games Won: \`${h.gamesWon}\` | Win Percentage: \`${h.winPercentage}%\``, inline: false }));
        o.ratings.forEach(r => embedData.push({ name: `${r.rank}`, value: r.role, inline: true }));

        msg .addField(`\`${o.platform}\``, 'Platform', true)
            .addField(`\`${o.region}\``, 'Region', true)
            .addField(`\`${o.battletag}\``, 'Blizzard Battletag', false)
            .addField(`Prestige \`${o.prestige}\`, Level \`${o.level}\``, 'Overwatch Level', false)
            .addField(`Endorsement \`${o.endorsement}\``, 'Endorsement', false)
            .addFields(embedData)
            .setFooter(`Data last linked: ${o.updatedAt}`);
    }

    return msg;
}

async function retrievePortraits() {
    if (portraits && portraits.length > 0) 
        return;

    try {
        portraits = JSON.parse(await fs.readFile('./assets/portrait.json', 'utf8')).portraits;
    } catch {
        portraits = [];
    }
}

function chooseRandomPortrait() {
    return portraits[Math.floor(Math.random() * portraits.length)];
}