/**
 * File: server.ts
 * Date: July 30, 2020
 * Author: Chaz-Lee Pierre
 * Purpose: This file contains the logic for retrieving data from an Overwatch API.
 */

import { OWProfile } from './models/owprofile';
import { Player } from './models/player';

const axios = require('axios').default;

let BASE_API_URL = "https://ow-api.com/v1/stats";

export async function getPlayer(id: number, username: string, discriminator: number, avatar: string): Promise<Player> {
    return new Player(id, username, discriminator, avatar);
};

async function getOWProfileFromAPI(platform: string = "pc", region: string = "us", battletag: string, complete: boolean = false) {
    let c: string = (complete) ? "complete" : "profile"; // get detailed or non-detailed stats
    let res;

    try {
        res = await axios.get(`${BASE_API_URL}/${platform}/${region}/${battletag.replace("#", "-")}/${c}`);
    } catch (err) {
        console.log(err);
    }
    
    // TODO: ERROR HANDLING INCASE RESPONSE FAILS

    return res;
}

export async function getPortrait(platform: string = "pc", region: string = "us", battletag: string) : Promise<string> {
    let res = await getOWProfileFromAPI(platform, region, battletag, false);
    return res.data.icon ? res.data.icon : "";
}

export async function retrieveOWProfile(platform: string = "pc", region: string = "us", battletag: string): Promise<OWProfile> {
    let res = await getOWProfileFromAPI(platform, region, battletag, true);

    let player: OWProfile = new OWProfile(battletag, platform, region);

    player.endorsement = res.data.endorsement;
    player.isPrivate = res.data.private;
    player.level = res.data.level;
    player.prestige = res.data.prestige;
    if (res.data.ratings) res.data.ratings.forEach((r: any) => player.ratings.push({ rank: r.level, role: r.role }));
    if (res.data.competitiveStats.topHeroes) {
        // get the top three heroes based on time played
        let topHeroes = Object.entries(res.data.competitiveStats.topHeroes)
            .sort((a: [string, any], b: [string, any]) => { 
                let a_time = a[1].timePlayed.split(':').reduce((acc: number, time: string) => (60 * acc) + +time); // convert "hh:mm:ss"
                let b_time = b[1].timePlayed.split(':').reduce((acc: number, time: string) => (60 * acc) + +time); // to seconds
                return b_time - a_time;
            })
            .slice(0, 3);
        topHeroes.forEach((h: [string, any]) => player.topHeroes.push({ 
            name: h[0].charAt(0).toUpperCase() + h[0].slice(1), // capitalize name
            timePlayed: h[1].timePlayed, 
            gamesWon: h[1].gamesWon, 
            winPercentage: h[1].winPercentage 
        }));
    }
    return player;
}